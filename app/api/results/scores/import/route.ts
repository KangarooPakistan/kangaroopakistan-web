import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";
import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";

// POST /api/results/scores/import
// Accepts multipart/form-data with fields:
// - file: Excel (.xlsx) file containing rows matching Score columns
// - contestId: string contest identifier
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const contestId = form.get("contestId")?.toString();
    const mode = (form.get("mode")?.toString() || "").toLowerCase(); // "replace" (default) or "append"

    if (!contestId) {
      return NextResponse.json(
        { success: false, message: "Missing 'contestId' in form-data" },
        { status: 400 }
      );
    }
    const cid: string = contestId;

    // Validate file exists and is a Blob (not a string)
    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Missing 'file' in form-data (expected a file part)",
        },
        { status: 400 }
      );
    }

    // Read workbook from uploaded file
    const blob = file as Blob;
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    if (workbook.SheetNames.length === 0) {
      return NextResponse.json(
        { success: false, message: "No sheets found in the uploaded file" },
        { status: 400 }
      );
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Required header names in exact order
    const REQUIRED_HEADERS = [
      "ROLL_NO",
      "CREDIT_SCORE",
      "C_TOTAL",
      "C_ROW1",
      "C_ROW2",
      "C_ROW3",
      "WRONG",
      "MISSING",
      "DESCRIPTION",
      "SCORE",
      "PERCENTAGE",
      "TOTAL_MARKS",
    ];

    // Read as array-of-arrays to validate exact header order
    const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: false,
    }) as any[][];

    if (!aoa || aoa.length < 2) {
      return NextResponse.json(
        { success: false, message: "No data rows found in the first sheet" },
        { status: 400 }
      );
    }

    const rawHeader = (aoa[0] || []).map((h: any) =>
      h == null ? "" : String(h).trim()
    );
    const headerMatches =
      rawHeader.length === REQUIRED_HEADERS.length &&
      rawHeader.every((h, i) => h === REQUIRED_HEADERS[i]);

    if (!headerMatches) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid header. Expected: " +
            REQUIRED_HEADERS.join(", ") +
            ". Ensure names and order match exactly.",
          receivedHeader: rawHeader,
        },
        { status: 400 }
      );
    }

    // Helpers to coerce types
    const toNum = (v: any): number | null => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const toBig = (v: any): bigint | null => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      return BigInt(Math.trunc(n));
    };
    const toStr = (v: any): string | null => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      return s.length ? s : null;
    };

    // Map each row according to the required header positions
    const data: Prisma.ScoreCreateManyInput[] = aoa.slice(1).map((row, idx) => {
      const get = (i: number) => (i < row.length ? row[i] : null);

      const entry: Prisma.ScoreCreateManyInput = {
        contestId: cid,
        rollNo: toStr(get(0)), // ROLL_NO
        creditScore: toNum(get(1)), // CREDIT_SCORE
        cTotal: toNum(get(2)), // C_TOTAL
        cRow1: toNum(get(3)), // C_ROW1
        cRow2: toNum(get(4)), // C_ROW2
        cRow3: toNum(get(5)), // C_ROW3
        wrong: toNum(get(6)), // WRONG
        missing: toNum(get(7)), // MISSING
        description: toStr(get(8)), // DESCRIPTION
        score: toBig(get(9)), // SCORE
        percentage:
          get(10) !== null && get(10) !== undefined && get(10) !== ""
            ? new Prisma.Decimal(Number(get(10)))
            : null, // PERCENTAGE
        totalMarks: toBig(get(11)), // TOTAL_MARKS
      };

      return entry;
    });

    // Ensure all rows have rollNo
    const invalid = data.findIndex((d) => !d.rollNo);
    if (invalid !== -1) {
      return NextResponse.json(
        {
          success: false,
          message: `Row ${invalid + 2} is missing a valid ROLL_NO`,
        },
        { status: 400 }
      );
    }

    if (mode === "append") {
      // Append mode: do NOT delete existing; filter out rows whose rollNo already exists
      const existing = await db.score.findMany({
        where: { contestId: cid },
        select: { rollNo: true },
      });
      const existingSet = new Set(
        existing
          .map((e) => (typeof e.rollNo === "string" ? e.rollNo : ""))
          .filter((s) => s)
      );

      // Deduplicate within incoming data by rollNo and exclude existing
      const seenIncoming = new Set<string>();
      const filtered = data.filter((d) => {
        const rn = d.rollNo as string | null;
        if (!rn) return false;
        if (existingSet.has(rn)) return false;
        if (seenIncoming.has(rn)) return false;
        seenIncoming.add(rn);
        return true;
      });

      if (filtered.length === 0) {
        return NextResponse.json(
          {
            success: true,
            mode: "append",
            message: "No new rows to append (all duplicates)",
            contestId: cid,
            insertedCount: 0,
            skippedCount: data.length,
          },
          { status: 200 }
        );
      }

      const created = await db.score.createMany({
        data: filtered,
        skipDuplicates: true,
      });

      return NextResponse.json(
        {
          success: true,
          mode: "append",
          message: "Scores appended successfully",
          contestId: cid,
          insertedCount: created.count,
          skippedCount: data.length - filtered.length,
        },
        { status: 200 }
      );
    } else {
      // Default: REPLACE mode
      // 1) Remove existing results and scores for this contest to avoid FK issues
      await db.$transaction([
        db.result.deleteMany({ where: { contestId: cid } }),
        db.score.deleteMany({ where: { contestId: cid } }),
      ]);

      // 2) Bulk insert scores
      const created = await db.score.createMany({ data, skipDuplicates: true });

      return NextResponse.json(
        {
          success: true,
          mode: "replace",
          message: "Scores imported successfully",
          contestId: cid,
          insertedCount: created.count,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Error importing scores:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to import scores",
        error: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
