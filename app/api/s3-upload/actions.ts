"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto"
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex")


const region = process.env.AWS_BUCKET_REGION ?? "";
const accessKeyId = process.env.AWS_ACCESS_KEY ?? "";
const secretAccessKey = process.env.AWS_SECRET_KEY ?? "";
// const bucket = process.env.AWS_BUCKET_NAME! ?? "";
const s3Client = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
})

const acceptedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",


]
export async function getSignedURL(type: string, checksum: string){
    const session = await getServerSession(authOptions)
    if(!session){
        return {failure: "Not authenticated"}
    }
    if(!acceptedTypes.includes(type)){
        return {failure: "invalid file type"}
    }
    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: generateFileName(),
        ContentType: type,
        ChecksumSHA256: checksum,
        Metadata:{
            userId: session.user.id,

        } 
      })
    const url = await getSignedUrl(
        s3Client,
        putObjectCommand,
        { expiresIn: 60 } // 60 seconds
      )
      
    return {success: {url}}
}