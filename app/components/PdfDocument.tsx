import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",

    textAlign: "center",
    textTransform: "uppercase",
  },
  subHeaderBetween: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  studentInfo: {
    marginBottom: 4,
  },
  studentInfoRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 4,
  },
  studentInfoTitle: {
    fontSize: 12,
    width: "100px",
    fontWeight: "heavy",
  },
  studentInfoContent: {
    fontSize: 12,
    marginLeft: "20px",
  },
  answerGrid: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
  },
  answerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "33%", // Set width for 3 columns
    paddingBottom: 10, // You can set padding for separation between rows
  },
  questionNumberBox: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  questionNumber: {},
  option: {
    fontSize: 12,
    marginRight: "2px",
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 5,
  },
  answerRowInst: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 2,
  },
  optionBox: {
    width: "20px",
    height: "20px",
    borderWidth: "1px",
    borderColor: "black",
    marginRight: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Needed to
  },
  optionBoxForAnswers: {
    width: "20px",
    height: "20px",
    display: "flex",
    borderWidth: "1px",
    borderColor: "black",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  optionBoxLast: {
    width: "50px",
    height: "20px",
    borderWidth: "1px",
    borderColor: "black",
    marginRight: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Needed to
  },
  optionText: {
    fontSize: 10,
    textAlign: "center",
  },
  correctFilling: {
    backgroundColor: "black",
  },
  wrongFilling: {
    // Style for wrong filling can include a cross, different color, etc.
    // This example just changes the border color to red
    borderColor: "red",
  },
  filledOption: {
    // When the option is filled incorrectly
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  instBox: {
    borderWidth: 1,
    padding: "10px",
    borderColor: "black",
    marginVertical: "20px",
  },
  cross: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  crossLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "blue",
    transform: "rotate(-45deg)", // Correctly formatted rotate transform
    // Rotate line to create an X
  },
  crossLineReverse: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "blue",
    transform: "rotate(45deg)", // Rotate line in the opposite direction to complete the X
  },
  tickContainer: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tick: {
    position: "absolute",
    border: "2px solid blue", // Tick color
    borderTop: "none",
    borderRight: "none",
    width: "16px", // Adjust width as needed
    height: "8px", // Adjust height as needed
    transform: "rotate(-45deg)", // Rotate to create the tick shape
    marginBottom: "5px", // Push down to fit within the box
  },
  optionTextWrong: {
    fontSize: "10px",
    position: "relative",
    zIndex: "1",
  },
  circle: {
    width: "15px",
    height: "15px",
    position: "absolute",
    borderRadius: "7.5px",
    backgroundColor: "blue",
  },
  wrongFillingLast: {
    background: "linear-gradient(to right, black 50%, transparent 50%)",
    borderRight: "none", // Remove the border to make it look like a single box
  },
  // Add a right box style to remove the left border to continue the illusion
  rightBox: {
    borderLeft: "none",
  },
  gradientBox: {
    display: "flex",
    flexDirection: "row",
  },
  halfBlack: {
    width: "24px", // Half of the optionBox width
    height: "12px", // Same as the optionBox height
    backgroundColor: "black",
    top: "4px",
    left: "10px",
    position: "absolute",
  },
  wrongBox: {
    marginRight: "20px",
    marginVertical: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  correctBox: {
    marginTop: "10px",
    marginVertical: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: "20px",
  },
  // halfTransparent: {
  //   width: "15px", // Half of the optionBox width
  //   height: "30px", // Same as the optionBox height
  //   backgroundColor: "transparent",
  // },
});

interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  studentLevel: string;
  studentClass: string; // Changed from `class` to `studentClass`
  schoolName: string | null;
  address: string | null;
  districtCode: string | null;
  schoolId: number;
}

interface PdfDocumentProps {
  students: Student[];
}

const PdfDocumentPage: React.FC<PdfDocumentProps> = ({ students }) => (
  <Document>
    {students.map((student, index) => (
      <Page wrap size="A4" style={styles.page} key={index}>
        <Text style={styles.header}>
          International Kangaroo Mathematics Contest
        </Text>
        <Text style={styles.subHeaderBetween}>Answer Sheet</Text>

        <Text style={styles.subHeader}>
          Student Level ({student.studentLevel})
        </Text>

        {/* Student Info */}
        <View style={styles.studentInfo}>
          {/* Repeat this View for each piece of student information */}
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Roll No</Text>
            <Text style={styles.studentInfoContent}>{student.rollNumber}</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>District</Text>
            <Text style={styles.studentInfoContent}>
              {student.districtCode}
            </Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Student Name</Text>
            <Text style={styles.studentInfoContent}>{student.studentName}</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Father Name</Text>
            <Text style={styles.studentInfoContent}>{student.fatherName}</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Class/Grade</Text>
            <Text style={styles.studentInfoContent}>
              {student.studentClass}
            </Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Institution Name</Text>
            <Text style={styles.studentInfoContent}>{student.schoolName}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Address</Text>
            <Text style={styles.studentInfoContent}>{student.address}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Institution Code</Text>
            <Text style={styles.studentInfoContent}>{student.schoolId}</Text>
          </View>

          {/* ... other student info rows */}
        </View>
        <View style={styles.instBox}>
          {/* Row with correct filling example */}
          <Text style={styles.optionText}>
            Choose only one of the five proposed answers[A,B,C,D,E] and fill in
            the box with your answer. Example of correctly filled table of
            answer is.
          </Text>

          <View style={styles.correctBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>B</Text>
              </View>
              <View style={[styles.optionBox, styles.correctFilling]}></View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
                <View style={styles.cross}>
                  <View style={styles.crossLine}></View>
                  <View style={styles.crossLineReverse}></View>
                </View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>B</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>C</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
              {/* ... other options ... */}
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionTextWrong}>B</Text>
                <View style={styles.tick}></View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>C</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>B</Text>
              </View>

              <View style={styles.optionBox}>
                <Text style={styles.optionTextWrong}>C</Text>
                <View style={styles.circle}></View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text>A</Text>
              </View>

              <View style={[styles.gradientBox]}>
                <View style={styles.optionBox}>
                  <Text style={styles.optionText}>B</Text>
                </View>
                <View style={styles.halfBlack} />
                <View style={styles.optionBox}>
                  <Text style={styles.optionText}>C</Text>
                </View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
        </View>

        {/* Answer Grid */}
        <View style={styles.answerGrid}>
          {[...Array(30)].map((_, questionIndex) => (
            <View style={styles.answerRow} key={questionIndex}>
              <View style={styles.questionNumberBox}>
                <Text style={styles.option}>{questionIndex + 1}</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>A</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>B</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>C</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>D</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>E</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Add other elements such as instructions, footer, etc. */}
      </Page>
    ))}
  </Document>
);

export default PdfDocumentPage;
