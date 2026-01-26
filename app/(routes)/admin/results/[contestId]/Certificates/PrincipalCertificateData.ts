export interface PrincipalCertificateData {
  name: string;
  abbreviation: string;
  data: Data[];
}

export interface Data {
  p_Name: string;
  schoolId?: number | null;
  schoolName: string;
}
export const eelpcertificateData: PrincipalCertificateData = {
  name: "Exemplary Educational Leadership",
  abbreviation: "EEL",
  data: [
    {
      p_Name: "RAHAT AKBAR",
      schoolId: 1247,
      schoolName: "BLOOMFIELD HALL SCHOOL MULTAN CANTT",
    },
    {
      p_Name: "NADIA ALTAF",
      schoolId: 1341,
      schoolName: "LAHORE GRAMMAR SCHOOL",
    },
  ],
};
export const celcertificateData: PrincipalCertificateData = {
  name: "Commendable Educational Leadership",
  abbreviation: "CEL",
  data: [
 {
  "schoolId": 374,
  "schoolName": "THE GUIDANCE HOUSE SCHOOL & COLLEGE SYSTEM MIRPUR AJK",
  "p_Name": "UZMA MUSHTAQ"
 },
 {
  "schoolId": 596,
  "schoolName": "FIRST STEPS SCHOOL OF ARTS & SCIENCES SENIOR CAMPUS ",
  "p_Name": "SARAH HAYAT"
 },
 {
  "schoolId": 1301,
  "schoolName": "PUNJAB COLLEGE SHALAMAR MAIN (CAMPUS #11)",
  "p_Name": "HAMMAD ASHFAQ "
 },
 {
  "schoolId": 1366,
  "schoolName": "ACADEMUS INTERNATIONAL SCHOOL ",
  "p_Name": "SARAH RASHID "
 },
 {
  "schoolId": 1380,
  "schoolName": "ISLAMABAD CONVENT SCHOOL, H-8\/4 CAMPUS",
  "p_Name": "SR. M. MAGDALENE YOUSAF O.P "
 },
 {
  "schoolName": "ROOTS GARDEN SCHOOLS",
  "p_Name": "RIFFAT MUSHTAQ",
  "schoolId": null,
 },

],
};
export const oaepcertificateData: PrincipalCertificateData = {
  name: "Outstanding Academic Leadership",
  abbreviation: "OAEP",
  data: [
 {
  "schoolId": 171,
  "schoolName": "BEACONHOUSE SCHOOL SYSTEM CIVIL LINES PRIMARY CAMPUS, FAISALABAD",
  "p_Name": "NOUSHEEN HAIDER"
 },
 {
  "schoolId": 286,
  "schoolName": "LAHORE GRAMMAR SCHOOL (LAND MARK) CANTT BRANCH",
  "p_Name": "ZAHRA SAEED"
 },
 {
  "schoolId": 659,
  "schoolName": "MONTESSORI COMPLEX CAMBRIDGE SCHOOL",
  "p_Name": "GHAZALA JAMIL"
 },
 {
  "schoolId": 719,
  "schoolName": "THE LEARNING CIRCLE",
  "p_Name": "FARZANA HAMID"
 },
 {
  "schoolId": 721,
  "schoolName": "MIANWALI EDUCATION TRUST SCHOOL",
  "p_Name": "KHOLA NIAZI"
 },
 {
  "schoolId": 742,
  "schoolName": "COMMUNITY BASED EDUCATIONAL SOCIETY, ALYABAD",
  "p_Name": "ASHRAF SALEEM SURANI"
 },
 {
  "schoolId": 1024,
  "schoolName": "BEACON LIGHT ACADEMY",
  "p_Name": "SIDRAH IMRAN ALI"
 },
 {
  "schoolId": 1152,
  "schoolName": "INTERNATIONAL SCHOOL LAHORE PINE AVENUE ",
  "p_Name": "FATIMA KHURRAM"
 },
 {
  "schoolId": 1322,
  "schoolName": "ISLAMABAD COLLEGE OF ARTS AND SCIENCES",
  "p_Name": "NUSRAT TAHIR"
 },
 {
  "schoolId": 1347,
  "schoolName": "INTERNATIONAL ISLAMIC UNIVERSITY ISLAMABAD SCHOOLS, G-13 CAMPUS, ISLAMABAD",
  "p_Name": "KANWAL NASEER"
 },
 {
  "schoolId": 1365,
  "schoolName": "THE FROEBEL'S HIGH SCHOOL",
  "p_Name": "EISHA TARIQ REHMAN"
 }
],
};

export const dpcpcertificateData: PrincipalCertificateData = {
  name: "Distinguished Institutional Leadership	",
  abbreviation: "DPC",
  data: [
 {
  "schoolId": 5,
  "schoolName": "NATIONAL GRAMMAR SCHOOL JOHAR TOWN",
  "p_Name": "MUHAMMAD IRSHAD TAHIR"
 },
 {
  "schoolId": 9,
  "schoolName": "ACE INTERNATIONAL ACADEMY",
  "p_Name": "MARIUS WESSELS"
 },
 {
  "schoolId": 102,
  "schoolName": "DIVISIONAL PUBLIC SCHOOL AND COLLEGE RAWALPINDI",
  "p_Name": "SAMINA KHAN"
 },
 {
  "schoolId": 109,
  "schoolName": "THE THINKERS SCHOOL",
  "p_Name": "VIQAR HABIB BOKHARI"
 },
 {
  "schoolId": 124,
  "schoolName": "AMERICAN LYCETUFF SCHOOL",
  "p_Name": "TASLEEM AKHTAR"
 },
 {
  "schoolId": 130,
  "schoolName": "CHENAB COLLEGE JHANG",
  "p_Name": "MUHAMMAD IMRAN NAIK"
 },
 {
  "schoolId": 145,
  "schoolName": "LAHORE COLLEGE OF ARTS AND SCIENCES",
  "p_Name": "DR UZMA AZHAR"
 },
 {
  "schoolId": 181,
  "schoolName": "HAYAT SCHOOL & COLLEGE (MAIN CAMPUS)",
  "p_Name": "PROF. AKHTAR ALI QURESHI"
 },
 {
  "schoolId": 188,
  "schoolName": "KID KARE SCHOOL",
  "p_Name": "ASMA AHMED"
 },
 {
  "schoolId": 215,
  "schoolName": "ROOTS SCHOOL SYSTEM DHA-I FLAGSHIP CAMPUS (JUNIOR SCHOOL)",
  "p_Name": "SADIA HAIDER"
 },
 {
  "schoolId": 221,
  "schoolName": "ROOTS GARDEN SCHOOL ASKARI-X  FLAGSHIP CAMPUS",
  "p_Name": "FOZIA ABBASI"
 },
 {
  "schoolId": 222,
  "schoolName": "ROOTS GARDEN SCHOOL JINNAH FLAGSHIP HARLEY CAMPUS",
  "p_Name": "AYESHA AYUB KHAN"
 },
 {
  "schoolId": 230,
  "schoolName": "THE EDUCATORS PABBI CAMPUS",
  "p_Name": "HAIDER ZAMAN KHATTAK"
 },
 {
  "schoolId": 233,
  "schoolName": "ROOTS MILLENNIUM SCHOOLS HILL VIEW CAMPUS, MIRPUR",
  "p_Name": "SARA ZAHID"
 },
 {
  "schoolId": 234,
  "schoolName": "DHA JUNIOR SCHOOL Z BLOCK ",
  "p_Name": "NATASHA HAQ"
 },
 {
  "schoolId": 236,
  "schoolName": "FG JUNIOR PUBLIC SCHOOL (1ST SHIFT)",
  "p_Name": "RIFFAT TAHIR"
 },
 {
  "schoolId": 239,
  "schoolName": "THE EDUCATORS SCHOOL SHAH RUKN-E-ALAM CAMPUS",
  "p_Name": "ANIQUA HAIDER AWAN"
 },
 {
  "schoolId": 250,
  "schoolName": "THE MILLENNIUM EDUCATION GREENWICH CAMPUS",
  "p_Name": "AYESHA ARSHAD "
 },
 {
  "schoolId": 259,
  "schoolName": "ROOTS MILLENNIUM HOLBORN CAMPUS",
  "p_Name": "ZAHRA SUHAIL"
 },
 {
  "schoolId": 273,
  "schoolName": "UMM AL QURA SCHOOLS PAKISTAN",
  "p_Name": "SALMA FAROOQ KHAN"
 },
 {
  "schoolId": 278,
  "schoolName": "CITI GRAMMAR SCHOOL",
  "p_Name": "AMBREEN ZUBAIR"
 },
 {
  "schoolId": 300,
  "schoolName": "ACADEMIA CIVITAS",
  "p_Name": "ALMAS RIAZ"
 },
 {
  "schoolId": 315,
  "schoolName": "CHISHTIAN SCIENCE SCHOOL OXFORD CAMPUS (BOYS)",
  "p_Name": "UZAIR AHMED"
 },
 {
  "schoolId": 327,
  "schoolName": "LAHORE LITERATI MONTESSORI & HIGH SCHOOL",
  "p_Name": "RUBINA MUSHTAQ"
 },
 {
  "schoolId": 368,
  "schoolName": "THE GUIDANCE HOUSE SCHOOL & COLLEGE SYSTEM RAWALAKOT",
  "p_Name": "SEHRISH IQBAL"
 },
 {
  "schoolId": 384,
  "schoolName": "FG PUBLIC SCHOOL (GIRLS) GULISTAN ROAD QUETTA CANTT",
  "p_Name": "HUMERA YOUNAS"
 },
 {
  "schoolId": 419,
  "schoolName": "FG PUBLIC SCHOOL NO 3 BOYS WAH CANTT.",
  "p_Name": "MUHAMMAD ASHRAF AWAN"
 },
 {
  "schoolId": 459,
  "schoolName": "ROOTS MILLENNIUM SCHOOL WEMBLEY CAMPUS SARGODHA",
  "p_Name": "MAHIRA SHAHID"
 },
 {
  "schoolId": 465,
  "schoolName": "SIR SYED SCHOOL CAMPUS 7 WAH CANTT",
  "p_Name": "SHAZIA ISLAM"
 },
 {
  "schoolId": 486,
  "schoolName": "IQRA PUBLIC SCHOOL AND COLLEGE KOHAT",
  "p_Name": "HAROON UR RASHEED"
 },
 {
  "schoolId": 521,
  "schoolName": "ROOTS MILLENNIUM SCHOOL, OXBRIDGE CAMPUS ",
  "p_Name": "SYEDA NOSHEEN HUMA NASIR"
 },
 {
  "schoolId": 574,
  "schoolName": "TNS BEACONHOUSE",
  "p_Name": "IAN RILEY"
 },
 {
  "schoolId": 601,
  "schoolName": "NATIONAL GRAMMAR SCHOOL, VALENCIA CAMPUS",
  "p_Name": "RABIA HASNAAT"
 },
 {
  "schoolId": 606,
  "schoolName": "UNITED CHARTER SCHOOLS PARAGON CAMPUS",
  "p_Name": "SYEDA SAIRA RIZVI"
 },
 {
  "schoolId": 608,
  "schoolName": "NATIONAL GRAMMAR SCHOOL PEOPLES COLONY",
  "p_Name": "MEHWISH YASIN"
 },
 {
  "schoolId": 626,
  "schoolName": "SICAS DHA LAHORE",
  "p_Name": "NAUSHEEN ADNAN"
 },
 {
  "schoolId": 649,
  "schoolName": "ISLAMABAD COLLEGE FOR BOYS, G-6\/3 ISLAMABAD.",
  "p_Name": "PROFESSOR DR. YASEEN AFAQI"
 },
 {
  "schoolId": 654,
  "schoolName": "FUTUREWORLD SCHOOL AND COLLEGE, BAHRIA TOWN",
  "p_Name": "KALEEM RAJPUT"
 },
 {
  "schoolId": 661,
  "schoolName": "FUTURE WORLD SCHOOL DHA KP",
  "p_Name": "WASFA AMBER"
 },
 {
  "schoolId": 668,
  "schoolName": "STUDENT ACADEMY",
  "p_Name": "KHADIJA MOHIB"
 },
 {
  "schoolId": 677,
  "schoolName": "SCHOOL FOR CONTEMPORARY AND ISLAMIC LEARNING",
  "p_Name": "LUBNA KAMRAN "
 },
 {
  "schoolId": 691,
  "schoolName": "FAZAIA COLLEGE OF EDUCATION FOR WOMEN, LAHORE CANTT",
  "p_Name": "DR. ITTRAT IRFAN"
 },
 {
  "schoolId": 703,
  "schoolName": "PUNJAB COLLEGE OF COMMERCE",
  "p_Name": "SOHAIL QADEER"
 },
 {
  "schoolId": 713,
  "schoolName": "ROOTS MILLENNIUM SCHOOLS, PINE CAMPUS",
  "p_Name": "FARHANA TAJ"
 },
 {
  "schoolId": 715,
  "schoolName": "PUNJAB COLLEGE RAHIM YAR KHAN",
  "p_Name": "MUHAMMAD AYUB KHAN"
 },
 {
  "schoolId": 757,
  "schoolName": "THE PATRIOTS SCHOOL",
  "p_Name": "FAISAL ABDUS SATTAR"
 },
 {
  "schoolId": 760,
  "schoolName": "NAKHLAH JUNIOR CAMPUS SOCIETY",
  "p_Name": "SUMERA FARRUKH"
 },
 {
  "schoolId": 764,
  "schoolName": "SCHOOL FOR CONTEMPORARY AND ISLAMIC LEARNING",
  "p_Name": "LUBNA KAMRAN"
 },
 {
  "schoolId": 768,
  "schoolName": "LAHORE GRAMMAR SCHOOL CENTRAL PARK BRANCH",
  "p_Name": "SYEDA SOBIA FARHAN"
 },
 {
  "schoolId": 769,
  "schoolName": "NAKHLAH JUNIOR CAMPUS GULSHAN",
  "p_Name": "UZMA ZAHID"
 },
 {
  "schoolId": 824,
  "schoolName": "ROOTS MILLENNIUM MARBLE ARCH CAMPUS ",
  "p_Name": "SOBIA SAIFULLAH KHAN"
 },
 {
  "schoolId": 838,
  "schoolName": "THE LEGACY SCHOOL",
  "p_Name": "MUHAMMAD MAHMDOOD IQBAL"
 },
 {
  "schoolId": 843,
  "schoolName": "SCHOOL FOR CONTEMPORARY AND ISLAMIC LEARNING (JUNIOR BOYS BRANCH)",
  "p_Name": "RABIA MAJEED"
 },
 {
  "schoolId": 883,
  "schoolName": "FUTURE WORLD SCHOOL, ROOTS MILLENIUM DHA PHASE VI CAMPUS",
  "p_Name": "SHAZIA HASNAT"
 },
 {
  "schoolId": 885,
  "schoolName": "LAHORE GRAMMAR SCHOOL, JUNIOR BRANCH",
  "p_Name": "NAILA SAAD KHAN"
 },
 {
  "schoolId": 886,
  "schoolName": "LAHORE GRAMMAR SCHOOL-ESS GURUNANAK CAMPUS",
  "p_Name": "TANYA ADEEL"
 },
 {
  "schoolId": 924,
  "schoolName": "FUTURE WORLD SCHOOL GULBERG GREEN CAMPUS ISLAMABAD",
  "p_Name": "AYESHA DOGAR"
 },
 {
  "schoolId": 957,
  "schoolName": "ARMY PUBLIC SCHOOL FOR INTERNATIONAL STUDIES IQBAL CAMPUS GUJRANWALA",
  "p_Name": "FARIHA IRFAN"
 },
 {
  "schoolId": 963,
  "schoolName": "ST. MICHAEL’S CONVENT SCHOOL",
  "p_Name": "PETER MISQUITA"
 },
 {
  "schoolId": 969,
  "schoolName": "ROOTS IVY INTERNATIONAL SCHOOL, BAHAWALPUR",
  "p_Name": "AMBER AAKASH KHAN"
 },
 {
  "schoolId": 976,
  "schoolName": "ROOTS MILLENNIUM SCHOOL, INDUS CAMPUS ATTOCK",
  "p_Name": "ERUM FARUQ"
 },
 {
  "schoolId": 980,
  "schoolName": "VISION GRAMMAR SCHOOL",
  "p_Name": "BAKHSH ELAHI"
 },
 {
  "schoolId": 1029,
  "schoolName": "INTERNATIONAL SCHOOL LAHORE RING ROAD CAMPUS",
  "p_Name": "IRMA AHSAN"
 },
 {
  "schoolId": 1100,
  "schoolName": "FG SIR SYED JUNIOR PUBLIC SCHOOL GIRLS RAWALPINDI ",
  "p_Name": "ASMA IBRAHIM"
 },
 {
  "schoolId": 1111,
  "schoolName": "ARMY PUBLIC SCHOOL AND COLLEGE CHUNIAN CANTT",
  "p_Name": "RABIA HASSAN "
 },
 {
  "schoolId": 1113,
  "schoolName": "FG PUBLIC SCHOOL NO 5 GIRLS WAH CANTT",
  "p_Name": "SHAISTA ANJUM"
 },
 {
  "schoolId": 1169,
  "schoolName": "FG PUBLIC SCHOOL (BOYS) PESHAWAR ROAD RAWALPINDI ",
  "p_Name": "MUHAMMAD NADEEM KHAN"
 },
 {
  "schoolId": 1175,
  "schoolName": "BEACON LIGHT ACADEMY - PRIMARY CAMPUS MAYMAR",
  "p_Name": "YASMIN QAZI"
 },
 {
  "schoolId": 1189,
  "schoolName": "OPF GIRLS COLLEGE F-8\/2 ISLAMABAD",
  "p_Name": "BUSHRA BASHIR"
 },
 {
  "schoolId": 1193,
  "schoolName": "THE GUIDANCE HOUSE SCHOOL & COLLEGES, MUZAFFARABAD ",
  "p_Name": "UMMARA ALAM"
 },
 {
  "schoolId": 1220,
  "schoolName": "FAISALABAD GRAMMAR SCHOOL KOHINOOR CITY",
  "p_Name": "RIFFAT NAVEED"
 },
 {
  "schoolId": 1231,
  "schoolName": "KIPS SCHOOL KOT RADA KISHAN CAMPUS",
  "p_Name": "MUHAMMAD ZAFAR KHAN"
 },
 {
  "schoolId": 1234,
  "schoolName": "IBN E SINA COLLEGE DHA",
  "p_Name": "AAMINA KAMAL ILAHI"
 },
 {
  "schoolId": 1240,
  "schoolName": "THE EDUCATORS",
  "p_Name": "FOUZIA REHAN"
 },
 {
  "schoolId": 1252,
  "schoolName": "NATIONAL GRAMMAR SCHOOL JUBILEE CAMPUS",
  "p_Name": "NAZIA JAWAID"
 },
 {
  "schoolId": 1259,
  "schoolName": "AL YAQEEN SCHOOL NORTH NAZIMABAD",
  "p_Name": "ALIA DAWOOD "
 },
 {
  "schoolId": 1261,
  "schoolName": "IMPERIAL INTERNATIONAL SCHOOL AND COLLEGE. ISLAMABAD",
  "p_Name": "RAHEELA ASIF"
 },
 {
  "schoolId": 1263,
  "schoolName": "LAHORE GRAMMAR SCHOOL",
  "p_Name": "NAZIA ADEEL"
 },
 {
  "schoolId": 1279,
  "schoolName": "KEYNESIAN INSTITUTE OF MANAGEMENT & SCIENCES",
  "p_Name": "IRAM QAZI "
 },
 {
  "schoolId": 1280,
  "schoolName": "PUNJAB COLLEGES LAHORE",
  "p_Name": "SARWAT HASSAN"
 },
 {
  "schoolId": 1284,
  "schoolName": "FG PUBLIC SCHOOL BOYS BAHAWALPUR CANTT.",
  "p_Name": "HAFIZ NAVEED AHMED"
 },
 {
  "schoolId": 1285,
  "schoolName": "AL YAQEEN SCHOOL GULSHAN-E-IQBAL",
  "p_Name": "AFSHAN HAROON"
 },
 {
  "schoolId": 1286,
  "schoolName": "IU SCHOOL SYSTEM SHAHRAH-E-PAKISTAN CAMPUS",
  "p_Name": "DR HIRA WARSI"
 },
 {
  "schoolId": 1309,
  "schoolName": "PUNJAB COLLEGE WESTRIDGE CAMPUS",
  "p_Name": "MUHAMMAD AWAIS SALEEM"
 },
 {
  "schoolId": 1316,
  "schoolName": "LAHORE GRAMMAR, GUDWAL CAMPUS, WAH CANTT",
  "p_Name": "SAIMA PERVEZ"
 },
 {
  "schoolId": 1317,
  "schoolName": "LAHORE GRAMMAR SCHOOL",
  "p_Name": "FIZZAH RAZI"
 },
 {
  "schoolId": 1323,
  "schoolName": "LAHORE GRAMMAR SCHOOL ESS-KASUR",
  "p_Name": "DR. RAO BABAR JAMIL"
 },
 {
  "schoolId": 1329,
  "schoolName": "THE VANTAGE SCHOOL",
  "p_Name": "ITRAT ZAHID SHEIKH"
 },
 {
  "schoolId": 1336,
  "schoolName": "LAHORE GRAMMAR SCHOOL RAJPUT TOWN BRANCH",
  "p_Name": "NIGAR ZAHOOR"
 },
 {
  "schoolId": 1348,
  "schoolName": "FOUNTAINHEAD INTERNATIONAL SCHOOL",
  "p_Name": "SHAZIA SYED"
 },
 {
  "schoolId": 1349,
  "schoolName": "NOVA CITY PREMIER SCHOOL",
  "p_Name": "MAHRUKH ROMANI"
 },
 {
  "schoolId": 1350,
  "schoolName": "BEACON LIGHT ACADEMY (GRADE I-II ,GULSHAN CAMPUS)",
  "p_Name": "FARKHANDA GUFRAN"
 },
 {
  "schoolId": 1353,
  "schoolName": "SARGODHIAN SPIRIT PUBLIC SCHOOL RASHIDABAD",
  "p_Name": "AVM (RETD.) TAHIR RANJHA"
 },
 {
  "schoolId": 1354,
  "schoolName": "SIR SYED COLLEGE CAMPUS-I WAH CANTT",
  "p_Name": "NOOR-US-SABAH"
 },
 {
  "schoolId": 1355,
  "schoolName": "THE EDUCATORS (PAK KAUSAR TOWN CAMPUS) MALIR KARACHI ",
  "p_Name": "NADIA KHAN"
 },
 {
  "schoolId": 1359,
  "schoolName": "FROEBEL EDUCATION CENTRE",
  "p_Name": "MARIAM SHERA"
 },
 {
  "schoolId": 1362,
  "schoolName": "LAHORE GRAMMAR SCHOOL (SENIOR BRANCH)",
  "p_Name": "AMBREEN MEHVISH"
 },
 {
  "schoolId": 1372,
  "schoolName": "SCHOOL OF LEARNING & EDUCATION",
  "p_Name": "SHAHLA RIAZ"
 },
 {
  "schoolId": 1382,
  "schoolName": "PERFECT HIGHER SECONDARY SCHOOL",
  "p_Name": "NISAR ALI KHATTAK"
 },
 {
  "schoolId": 1386,
  "schoolName": "WESTMINSTER ACADEMY, ISLAMABAD JUNIOR SECTION",
  "p_Name": "GULANDAMA AHMED"
 },
 {
  "schoolId": 1394,
  "schoolName": "FAJR ACADEMY ",
  "p_Name": "ASIM ISMAIL"
 },
 {
  "schoolId": 1396,
  "schoolName": "PROFECTUS INTERNATIONAL SCHOOL",
  "p_Name": "ALMAS MUBASHIR"
 },
 {
  "schoolId": 1398,
  "schoolName": "AIR FOUNDATION SCHOOL SYSTEM AND COLLEGE B-17 CAMPUS",
  "p_Name": "SYED ZEESHAN SAEED"
 },
 {
  "schoolId": 1401,
  "schoolName": "STEP SCHOOL G.T ROAD ATTAWA GUJRANWALA",
  "p_Name": "SABA YASIR"
 },
 {
  "schoolId": 1408,
  "schoolName": "PROFECTUS  INTERNATIONAL SCHOOL & COLLEGE ",
  "p_Name": "SHUMAILA ADNAN"
 },
 {
  "schoolId": 1410,
  "schoolName": "THE SPIRIT SCHOOL LAYYAH CAMPUS",
  "p_Name": "WAQAR UL HASSAN"
 },
 {
  "schoolId": 1413,
  "schoolName": "ORIGINS SCHOOL",
  "p_Name": "NAHID JAPANWALA"
 }
],
};
