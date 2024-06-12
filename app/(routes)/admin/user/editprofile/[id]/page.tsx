"use client";
import React, { useEffect, useState } from "react";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast, ToastContainer } from "react-toastify";
import { useForm, useFieldArray, Controller } from "react-hook-form";

import "react-toastify/dist/ReactToastify.css";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserData {
  email: string;
  schoolId: number;
  schoolName: string;
  city: string;
  contactNumber: string;
  district: string;
  tehsil: string;
  fax: string;
  bankTitle: string;
  p_Name: string;
  p_contact: string;
  p_phone: string;
  p_email: string;
  c_Name: string;
  c_contact: string;
  c_phone: string;
  c_email: string;
  c_accountDetails: string;
  schoolAddress: string;
  // Define other properties here as needed
}
const formSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  p_Name: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's First Name cannot be empty",
  }),
  schoolName: z.string().refine((data) => data.trim() !== "", {
    message: "SchoolName cannot be empty",
  }),
  contactNumber: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964"),

  district: z.string().refine((data) => data.trim() !== "", {
    message: "District cannot be empty",
  }),
  tehsil: z.string().refine((data) => data.trim() !== "", {
    message: "Tehsil cannot be empty",
  }),
  fax: z.string(),
  bankTitle: z.string().refine((data) => data.trim() !== "", {
    message: "BankTitle cannot be empty",
  }),

  p_contact: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964"),
  p_phone: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),

  // .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964"),

  p_email: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's email cannot be empty",
  }),
  c_Name: z.string().refine((data) => data.trim() !== "", {
    message: "Coordinator's firstname cannot be empty",
  }),
  c_contact: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964"),
  c_phone: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964"),
  c_email: z
    .string()
    .email()
    .refine((data) => data.trim() !== "", {
      message: "Coordinator's email cannot be empty",
    }),
  c_accountDetails: z.string().refine((data) => data.trim() !== "", {
    message: "Coordinator's account details cannot be empty",
  }),
  schoolAddress: z.string().refine((data) => data.trim() !== "", {
    message: "School Address details cannot be empty",
  }),
});

const initialData: UserData = {
  email: "",
  schoolId: 0,
  schoolName: "",
  contactNumber: "",
  district: "",
  tehsil: "",
  city: "",
  fax: "",
  bankTitle: "",
  p_contact: "",
  p_phone: "",
  p_Name: "",
  p_email: "",
  c_Name: "",
  c_contact: "",
  c_phone: "",
  c_email: "",
  c_accountDetails: "",
  schoolAddress: "",
};
const UserRegister = () => {
  const [data, setData] = useState<UserData>(initialData);
  const router = useRouter();
  const [schoolIdFromBE, setSchoolIdFromBE] = useState<number | undefined>();
  const params = useParams();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: data.email,
      // password: "",
      schoolId: data.schoolId,
      schoolName: data.schoolName,
      contactNumber: data.contactNumber,
      district: data.district,
      tehsil: data.tehsil,
      fax: data.fax,
      bankTitle: data.bankTitle,
      p_Name: data.p_Name,
      p_contact: data.p_contact,
      p_phone: data.p_phone,
      p_email: data.email,
      c_Name: data.c_Name,
      c_contact: data.c_contact,
      c_phone: data.c_phone,
      c_email: data.c_email,
      city: data.city,
      schoolAddress: data.schoolAddress,
      c_accountDetails: data.c_accountDetails,
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/users/editprofile/${params.id}`);
      setData(response.data);
      console.log(response.data);
      setSchoolIdFromBE(response.data.schoolId);

      form.reset({
        email: response.data.email ?? "",
        schoolName: response.data.schoolName ?? "",
        contactNumber: response.data.contactNumber ?? "",
        district: response.data.district ?? "",
        tehsil: response.data.tehsil ?? "",
        fax: response.data.fax ?? "",
        schoolAddress: response.data.schoolAddress ?? "",
        bankTitle: response.data.bankTitle ?? "",
        p_Name: response.data.p_Name ?? "",
        p_contact: response.data.p_contact ?? "",
        p_phone: response.data.p_phone ?? "",
        p_email: response.data.p_email ?? "",
        city: response.data.city ?? "",
        c_Name: response.data.c_Name ?? "",
        c_contact: response.data.c_contact ?? "",
        c_phone: response.data.c_phone ?? "",
        c_email: response.data.c_email ?? "",
        c_accountDetails: response.data.c_accountDetails ?? "",
      });
    };
    fetchData();
  }, [form]);

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: UserData) => {
    console.log(values);
    // try {
    //   const payload = {
    //     ...values,
    //     schooldId: schoolIdFromBE,
    //     // Spread the form values
    //     role: "User", // Add the additional string
    //   };
    //   await axios.put(`/api/users/editprofile/${params.id}`, payload);
    //   form.reset();
    //   router.push(`/admin/users`);
    //   toast.success("🦄 Profile Updated successfully", {
    //     position: "bottom-center",
    //     autoClose: 5000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: "light",
    //   });
    // } catch (error) {
    //   toast.error("Error Updating Profile ", {
    //     position: "top-right",
    //     autoClose: 5000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: "light",
    //   });
    // }
  };
  const handleBack = () => {
    router.back();
  };
  const handleClassChange = (cityValue: string) => {
    console.log(cityValue);
    let districtValue = "";
    switch (cityValue) {
      case "Abbottabad":
        districtValue = "101";
        break;
      case "Bajur":
        districtValue = "102";
        break;
      case "Bannu":
        districtValue = "103";
        break;
      case "Batagram":
        districtValue = "104";
        break;
      case "Bunair":
        districtValue = "105";
        break;
      case "Charsada":
        districtValue = "106";
        break;
      case "Chitral":
        districtValue = "107";
        break;
      case "Chishtian":
        districtValue = "238";
        break;
      case "D. I. Khan":
        districtValue = "108";
        break;
      case "Hangu":
        districtValue = "109";
        break;
      case "Haripur":
        districtValue = "110";
        break;
      case "Karak":
        districtValue = "111";
        break;
      case "Khyber":
        districtValue = "112";
        break;
      case "Kohat":
        districtValue = "113";
        break;
      case "Kohistan":
        districtValue = "114";
        break;
      case "Kurram":
        districtValue = "115";
        break;
      case "Lakki Marwat":
        districtValue = "116";
        break;
      case "Lower Dir":
        districtValue = "117";
        break;
      case "Malakand":
        districtValue = "118";
        break;
      case "Mansehra":
        districtValue = "119";
        break;
      case "Mardan":
        districtValue = "120";
        break;
      case "Mohmand":
        districtValue = "121";
        break;
      case "North Waziristan":
        districtValue = "122";
        break;
      case "Nowshera":
        districtValue = "123";
        break;
      case "Orakzai":
        districtValue = "124";
        break;
      case "Peshawar":
        districtValue = "125";
        break;
      case "Shangla":
        districtValue = "126";
        break;
      case "South Waziristan":
        districtValue = "127";
        break;
      case "Swabi":
        districtValue = "128";
        break;
      case "Swat":
        districtValue = "129";
        break;
      case "Tank":
        districtValue = "130";
        break;
      case "Tor Garh":
        districtValue = "131";
        break;
      case "Upper Dir":
        districtValue = "132";
        break;
      case "Attock":
        districtValue = "201";
        break;
      case "Bahawalnagar":
        districtValue = "202";
        break;

      case "Bahawalpur":
        districtValue = "203";
        break;
      case "Bhakhar":
        districtValue = "204";
        break;
      case "Chakwal":
        districtValue = "205";
        break;
      case "Chiniot":
        districtValue = "206";
        break;
      case "D. G. Khan":
        districtValue = "207";
        break;
      case "Faisalabad":
        districtValue = "208";
        break;
      case "Gujranwala":
        districtValue = "209";
        break;
      case "Gujrat":
        districtValue = "210";
        break;
      case "Hafizabad":
        districtValue = "211";
        break;
      case "Islamabad":
        districtValue = "212";
        break;
      case "Jehlum":
        districtValue = "213";
        break;
      case "Jhang":
        districtValue = "214";
        break;
      case "Kasur":
        districtValue = "215";
        break;
      case "Khanewal":
        districtValue = "216";
        break;
      case "Khushab":
        districtValue = "217";
        break;
      case "Lahore":
        districtValue = "218";
        break;
      case "Layyah":
        districtValue = "219";
        break;
      case "Lodhran":
        districtValue = "220";
        break;
      case "Mandi Bahauddin":
        districtValue = "221";
        break;
      case "Mianwali":
        districtValue = "222";
        break;
      case "Multan":
        districtValue = "223";
        break;
      case "Muzaffar Garh":
        districtValue = "224";
        break;
      case "Nankana Sahib":
        districtValue = "225";
        break;
      case "Narowal":
        districtValue = "226";
        break;
      case "Okara":
        districtValue = "227";
        break;
      case "Pakpattan":
        districtValue = "228";
        break;
      case "Rahim Yar Khan":
        districtValue = "229";
        break;
      case "Rajanpur":
        districtValue = "230";
        break;
      case "Rawalpindi":
        districtValue = "231";
        break;
      case "Sahiwal":
        districtValue = "232";
        break;
      case "Sargodha":
        districtValue = "233";
        break;
      case "Sheikhupura":
        districtValue = "234";
        break;
      case "Sialkot":
        districtValue = "235";
        break;
      case "T.T. Singh":
        districtValue = "236";
        break;
      case "Vehari":
        districtValue = "237";
        break;
      case "Badin":
        districtValue = "301";
        break;
      case "Dadu":
        districtValue = "302";
        break;
      case "Ghotki":
        districtValue = "303";
        break;
      case "Hyderabad":
        districtValue = "304";
        break;
      case "Jacobabad":
        districtValue = "305";
        break;
      case "Jamshoro":
        districtValue = "306";
        break;
      case "Karachi Central":
        districtValue = "307";
        break;
      case "Karachi East":
        districtValue = "308";
        break;
      case "Karachi Malir":
        districtValue = "309";
        break;
      case "Karachi South":
        districtValue = "310";
        break;
      case "Karachi West":
        districtValue = "311";
        break;
      case "Kashmore":
        districtValue = "312";
        break;
      case "Khairpur":
        districtValue = "313";
        break;
      case "Korangi":
        districtValue = "314";
        break;
      case "Larkana":
        districtValue = "315";
        break;
      case "Matiari":
        districtValue = "316";
        break;
      case "Mir Pur Khas":
        districtValue = "317";
        break;
      case "Nowshero Feroze":
        districtValue = "318";
        break;
      case "Sanghar":
        districtValue = "319";
        break;
      case "Shahdadkot":
        districtValue = "320";
        break;
      case "Shaheed Banazir Abad":
        districtValue = "321";
        break;
      case "Shikarpur":
        districtValue = "322";
        break;
      case "Sujawal":
        districtValue = "323";
        break;
      case "Sukkur":
        districtValue = "324";
        break;
      case "Tando Allah Yar":
        districtValue = "325";
        break;
      case "Tando Muhammad Khan":
        districtValue = "326";
        break;
      case "Tharparkar":
        districtValue = "327";
        break;
      case "Thatta":
        districtValue = "328";
        break;
      case "Umer Kot":
        districtValue = "329";
        break;
      case "Awaran":
        districtValue = "401";
        break;
      case "Barkhan":
        districtValue = "402";
        break;
      case "Chagai":
        districtValue = "403";
        break;
      case "Dera Bugti":
        districtValue = "404";
        break;
      case "Duki":
        districtValue = "405";
        break;
      case "Gwadar":
        districtValue = "406";
        break;
      case "Harnai":
        districtValue = "407";
        break;
      case "Jaffarabad":
        districtValue = "408";
        break;
      case "Jhal Magsi":
        districtValue = "409";
        break;
      case "Kachhi/ Bolan":
        districtValue = "410";
        break;
      case "Kalat":
        districtValue = "411";
        break;
      case "Kech/Turbat":
        districtValue = "412";
        break;
      case "Kharan":
        districtValue = "413";
        break;
      case "Khuzdar":
        districtValue = "414";
        break;
      case "Kohlu":
        districtValue = "415";
        break;
      case "Lasbela":
        districtValue = "416";
        break;
      case "Loralai":
        districtValue = "417";
        break;
      case "Mastung":
        districtValue = "418";
        break;
      case "Musa Khel":
        districtValue = "419";
        break;
      case "Nasirabad/ Tamboo":
        districtValue = "420";
        break;
      case "Nushki":
        districtValue = "421";
        break;
      case "Panjgoor":
        districtValue = "422";
        break;
      case "Pishin":
        districtValue = "423";
        break;
      case "Qilla Abdullah":
        districtValue = "424";
        break;
      case "Qilla Saifullah":
        districtValue = "425";
        break;
      case "Quetta":
        districtValue = "426";
        break;
      case "Shaheed Sikandar Abad":
        districtValue = "427";
        break;
      case "Sherani":
        districtValue = "428";
        break;
      case "Sibbi":
        districtValue = "429";
        break;
      case "Sohbatpur":
        districtValue = "430";
        break;
      case "Washuk":
        districtValue = "431";
        break;
      case "Zhob":
        districtValue = "432";
        break;
      case "Ziarat":
        districtValue = "433";
        break;
      case "Mirpur":
        districtValue = "501";
        break;
      case "Skardu ":
        districtValue = "502";
        break;
      // Add more cases if needed
      default:
        break;
    }
    console.log(districtValue);
    form.setValue(`district`, districtValue);
  };
  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-start items-center">
        <Button variant="default" onClick={handleBack}>
          Back
        </Button>
      </div>
      <section className="bg-white mb-12">
        <div className=" pt-10 h-screen grid grid-cols-1">
          <div className="w-full rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0 mx-auto">
            <div className="p-6 space-y-3 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                Update account
              </h1>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 md:space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label">Email</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="input"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schoolName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          School Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schoolAddress"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          School Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Contact Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="051-1234567"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormLabel className="label mt-5">City</FormLabel>
                  <div className="">
                    <Controller
                      name="city"
                      control={form.control}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => {
                            field.onChange(e); // Important: update the form state
                            handleClassChange(e.target.value); // Update the level based on the class
                          }}
                          className="w-full p-2 text-xs md:text-base rounded border border-gray-300 focus:outline-none focus:border-blue-500">
                          <option value="">SELECT CITY</option>
                          <option value="Abbottabad">Abbottabad</option>
                          <option value="Attock">Attock</option>
                          <option value="Awaran">Awaran</option>
                          <option value="Badin">Badin</option>
                          <option value="Bahawalnagar">Bahawalnagar</option>
                          <option value="Bahawalpur">Bahawalpur</option>
                          <option value="Bajur">Bajur</option>
                          <option value="Bannu">Bannu</option>
                          <option value="Barkhan">Barkhan</option>
                          <option value="Batagram">Batagram</option>
                          <option value="Bhakhar">Bhakhar</option>
                          <option value="Bhakkar">Bhakkar</option>
                          <option value="Bunair">Bunair</option>
                          <option value="Charsada">Charsada</option>
                          <option value="Chagai">Chagai</option>
                          <option value="Chakwal">Chakwal</option>
                          <option value="Chishtian">Chishtian</option>
                          <option value="Chiniot">Chiniot</option>
                          <option value="Chitral">Chitral</option>
                          <option value="D. G. Khan">D. G. Khan</option>
                          <option value="D. I. Khan">D. I. Khan</option>
                          <option value="Dadu">Dadu</option>
                          <option value="Dera Bugti">Dera Bugti</option>
                          <option value="Dera Ismail Khan">
                            Dera Ismail Khan
                          </option>
                          <option value="Diamer">Diamer</option>
                          <option value="Duki">Duki</option>
                          <option value="Faisalabad">Faisalabad</option>
                          <option value="Ghizer">Ghizer</option>
                          <option value="Ghotki">Ghotki</option>
                          <option value="Gujranwala">Gujranwala</option>
                          <option value="Gujrat">Gujrat</option>
                          <option value="Gwadar">Gwadar</option>
                          <option value="Hafizabad">Hafizabad</option>
                          <option value="Hangu">Hangu</option>
                          <option value="Harnai">Harnai</option>
                          <option value="Haripur">Haripur</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Islamabad">Islamabad</option>
                          <option value="Jacobabad">Jacobabad</option>
                          <option value="Jaffarabad">Jaffarabad</option>
                          <option value="Jamshoro">Jamshoro</option>
                          <option value="Jehlum">Jehlum</option>
                          <option value="Jhang">Jhang</option>
                          <option value="Jhal Magsi">Jhal Magsi</option>
                          <option value="Jhelum">Jhelum</option>
                          <option value="Kachhi/ Bolan">Kachhi/ Bolan</option>
                          <option value="Kalat">Kalat</option>
                          <option value="Karachi Central">
                            Karachi Central
                          </option>
                          <option value="Karachi East">Karachi East</option>
                          <option value="Karachi Malir">Karachi Malir</option>
                          <option value="Karachi South">Karachi South</option>
                          <option value="Karachi West">Karachi West</option>
                          <option value="Kashmore">Kashmore</option>
                          <option value="Kachhi">Kachhi</option>
                          <option value="Karak">Karak</option>
                          <option value="Kasur">Kasur</option>
                          <option value="Kech/Turbat">Kech/Turbat</option>
                          <option value="Khairpur">Khairpur</option>
                          <option value="Khanewal">Khanewal</option>
                          <option value="Kharan">Kharan</option>
                          <option value="Khushab">Khushab</option>
                          <option value="Khuzdar">Khuzdar</option>
                          <option value="Khyber">Khyber</option>
                          <option value="Kohat">Kohat</option>
                          <option value="Kohistan">Kohistan</option>
                          <option value="Kohlu">Kohlu</option>
                          <option value="Korangi">Korangi</option>
                          <option value="Kurram">Kurram</option>
                          <option value="Kushab">Kushab</option>
                          <option value="Lahore">Lahore</option>
                          <option value="Lakki Marwat">Lakki Marwat</option>
                          <option value="Larkana">Larkana</option>
                          <option value="Lasbela">Lasbela</option>
                          <option value="Layyah">Layyah</option>
                          <option value="Lodhran">Lodhran</option>
                          <option value="Loralai">Loralai</option>
                          <option value="Lower Dir">Lower Dir</option>
                          <option value="Malakand">Malakand</option>
                          <option value="Mandi Bahauddin">
                            Mandi Bahauddin
                          </option>
                          <option value="Mansehra">Mansehra</option>
                          <option value="Mardan">Mardan</option>
                          <option value="Mastung">Mastung</option>
                          <option value="Matiari">Matiari</option>
                          <option value="Mianwali">Mianwali</option>
                          <option value="Mir Pur Khas">Mir Pur Khas</option>
                          <option value="Mirpur">Mirpur</option>
                          <option value="Mirpur Khas">Mirpur Khas</option>
                          <option value="Mohmand">Mohmand</option>
                          <option value="Multan">Multan</option>
                          <option value="Musa Khel">Musa Khel</option>
                          <option value="Muzaffarabad">Muzaffarabad</option>
                          <option value="Muzaffar Garh">Muzaffar Garh</option>
                          <option value="Nankana Sahib">Nankana Sahib</option>
                          <option value="Narowal">Narowal</option>
                          <option value="Nasirabad/Tamboo">
                            Nasirabad/Tamboo
                          </option>
                          <option value="Nawabshah">Nawabshah</option>
                          <option value="North Waziristan">
                            North Waziristan
                          </option>
                          <option value="Nowshera">Nowshera</option>
                          <option value="Nowshero Feroze">
                            Nowshero Feroze
                          </option>
                          <option value="Nushki">Nushki</option>
                          <option value="Okara">Okara</option>
                          <option value="Orakzai">Orakzai</option>
                          <option value="Pakpattan">Pakpattan</option>
                          <option value="Panjgoor">Panjgoor</option>
                          <option value="Peshawar">Peshawar</option>
                          <option value="Pishin">Pishin</option>
                          <option value="Poonch">Poonch</option>
                          <option value="Poonch">Poonch</option>
                          <option value="Poonch">Poonch</option>
                          <option value="Qilla Abdullah">Qilla Abdullah</option>
                          <option value="Qilla Saifullah">
                            Qilla Saifullah
                          </option>
                          <option value="Quetta">Quetta</option>
                          <option value="Rahim Yar Khan">Rahim Yar Khan</option>
                          <option value="Rajanpur">Rajanpur</option>
                          <option value="Rawalakot">Rawalakot</option>
                          <option value="Rawalpindi">Rawalpindi</option>
                          <option value="Sahiwal">Sahiwal</option>
                          <option value="Sahiwal">Sahiwal</option>
                          <option value="Sanghar">Sanghar</option>
                          <option value="Sargodha">Sargodha</option>
                          <option value="Shahdadkot">Shahdadkot</option>
                          <option value="Shaheed Banazir Abad">
                            Shaheed Banazir Abad
                          </option>
                          <option value="Shaheed Sikandar Abad">
                            Shaheed Sikandar Abad
                          </option>
                          <option value="Shahkot">Shahkot</option>
                          <option value="Shangla">Shangla</option>
                          <option value="Sherani">Sherani</option>
                          <option value="Sheikhupura">Sheikhupura</option>
                          <option value="Shikarpur">Shikarpur</option>
                          <option value="Sujawal">Sujawal</option>
                          <option value="Sialkot">Sialkot</option>
                          <option value="Sibbi">Sibbi</option>
                          <option value="Skardu">Skardu</option>
                          <option value="Sohbatpur">Sohbatpur</option>
                          <option value="South Waziristan">
                            South Waziristan
                          </option>
                          <option value="Sudhnuti">Sudhnuti</option>
                          <option value="Sukkur">Sukkur</option>
                          <option value="Swabi">Swabi</option>
                          <option value="Swat">Swat</option>
                          <option value="Tando Allah Yar">
                            Tando Allah Yar
                          </option>
                          <option value="Tando Muhammad Khan">
                            Tando Muhammad Khan
                          </option>
                          <option value="T.T. Singh">T.T. Singh</option>
                          <option value="Tank">Tank</option>
                          <option value="Taunsa">Taunsa</option>
                          <option value="Tharparkar">Tharparkar</option>
                          <option value="Thatta">Thatta</option>
                          <option value="Toba Tek Singh">Toba Tek Singh</option>
                          <option value="Tor Garh">Tor Garh</option>
                          <option value="Turbat">Turbat</option>
                          <option value="Umer Kot">Umer Kot</option>
                          <option value="Upper Dir">Upper Dir</option>
                          <option value="Vehari">Vehari</option>f
                          <option value="Wah">Wah</option>
                          <option value="Washuk">Washuk</option>
                          <option value="Zhob">Zhob</option>
                          <option value="Ziarat">Ziarat</option>
                        </select>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bankTitle"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          OFFICIAL BANK TITLE OF THE INSTITUTION&apos;s BANK
                          ACCOUNT FOR HONORARIUM
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="p_Name"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name="p_lName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  <FormField
                    control={form.control}
                    name="p_contact"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s Cell No.
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0333-1234567"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="p_phone"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s Phone No.
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="051-1234567"
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="p_email"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Principal&apos;s Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="c_Name"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="c_contact"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s Cell No.
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0333-1234567"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="c_email"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="c_accountDetails"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">
                          Coordinator&apos;s Account Details
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            className="input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-center mt-16">
                    <Button
                      disabled={isLoading}
                      variant="default"
                      className="px-10">
                      Update Profile
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserRegister;
