"use client";
import React, { useState } from "react";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeOff, Eye } from "lucide-react";

import { useForm, useFieldArray, Controller } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long") // Minimum length
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter") // At least one uppercase letter
    .regex(/[a-z]/, "Password must contain at least one lowercase letter") // At least one lowercase letter
    .regex(/[0-9]/, "Password must contain at least one number") // At least one number
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  schoolName: z.string().refine((data) => data.trim() !== "", {
    message: "School Name cannot be empty",
  }),
  contactNumber: z
    .string()
    .refine((data) => data.trim() !== "", {
      message: "Phone number cannot be empty",
    })
    .refine((data) => /^\d{3}-\d{7}$/.test(data), {
      message: "Phone number must be in the format 051-1234567",
    }),

  district: z.string().refine((data) => data.trim() !== "", {
    message: "District cannot be empty",
  }),
  city: z.string().refine((data) => data.trim() !== "", {
    message: "City cannot be empty",
  }),
  bankTitle: z.string().refine((data) => data.trim() !== "", {
    message: "BankTitle cannot be empty",
  }),
  // p_fName: z.string().refine((data) => data.trim() !== "", {
  //   message: "Principal's First Name cannot be empty",
  // }),
  p_Name: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's First Name cannot be empty",
  }),
  // p_lName: z.string().refine((data) => data.trim() !== "", {
  //   message: "Principal's last name cannot be empty",
  // }),
  p_contact: z
    .string()
    .refine((data) => data.trim() !== "", {
      message: "Phone number cannot be empty",
    })
    .refine((data) => /^\d{4}-\d{7}$/.test(data), {
      message: "Phone number must be in the format 0333-1234567",
    }),
  p_phone: z
    .string()
    .refine((data) => data.trim() !== "", {
      message: "Phone number cannot be empty",
    })
    .refine((data) => /^\d{3}-\d{7}$/.test(data), {
      message: "Phone number must be in the format 051-1234567",
    }),

  p_email: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's email cannot be empty",
  }),
  c_Name: z.string().refine((data) => data.trim() !== "", {
    message: "Coordinator's firstname cannot be empty",
  }),

  c_contact: z
    .string()
    .refine((data) => data.trim() !== "", {
      message: "Phone number cannot be empty",
    })
    .refine((data) => /^\d{4}-\d{7}$/.test(data), {
      message: "Phone number must be in the format 0333-1234567",
    }),
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
    message: "School Adress cannot be empty",
  }),
  // At least one special character
});

const UserRegister = () => {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      schoolName: "",
      contactNumber: "",
      district: "",
      city: "",

      bankTitle: "",
      p_Name: "",
      schoolAddress: "",
      p_contact: "",
      p_phone: "",
      p_email: "",
      c_Name: "",
      c_contact: "",

      c_email: "",
      c_accountDetails: "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    try {
      const payload = {
        ...values, // Spread the form values
        role: "User", // Add the additional string
      };
      console.log(payload);
      await axios.post("/api/users/signup", payload);
      form.reset();
      await router.push("/dashboard");
      toast.success("🦄 Account successfully created", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error: any) {
      toast.error(" " + error.response.data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
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
      case "Wah":
        districtValue = "239";
        break;
      case "Gojra":
        districtValue = "240";
        break;
      case "Jhelum":
        districtValue = "241";
        break;
      case "Khushab":
        districtValue = "242";
        break;
      case "Taunsa":
        districtValue = "243";
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
      case "Muzaffarabad":
        districtValue = "133";
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
      case "Mirpur Khas":
        districtValue = "330";
        break;
      case "Nawabshah":
        districtValue = "331";
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
      case "Nasirabad/Tamboo":
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
      case "Turbat":
        districtValue = "434";
        break;
      case "Mirpur":
        districtValue = "501";
        break;
      case "Skardu ":
        districtValue = "502";
        break;
      case "Rawalakot":
        districtValue = "503";
        break;
      case "Ghizer":
        districtValue = "504";
        break;
      // Add more cases if needed
      default:
        break;
    }
    console.log(districtValue);
    form.setValue(`district`, districtValue);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <section className="bg-white mb-12">
        <div className=" pt-10 h-screen grid grid-cols-1 md:grid-cols-2 gap-2 xl:gap-0">
          <div className="w-full rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0 mx-auto">
            <div className="p-6 space-y-3 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                Create account
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
                    name="password"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="label mt-5">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              disabled={isLoading}
                              className="input pl-10" // Adjust padding to accommodate the icon
                              placeholder="Enter your password"
                              {...field}
                            />
                            {showPassword ? (
                              <Eye
                                className="absolute top-3 right-3 cursor-pointer"
                                onClick={togglePasswordVisibility}
                              />
                            ) : (
                              <EyeOff
                                className="absolute top-3 right-3 cursor-pointer"
                                onClick={togglePasswordVisibility}
                              />
                            )}
                          </div>
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
                          <option value="Duki">Duki</option>
                          <option value="Faisalabad">Faisalabad</option>
                          <option value="Ghizer">Ghizer</option>
                          <option value="Ghotki">Ghotki</option>
                          <option value="Gojra">Gojra</option>
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
                          <option value="Khushab">Khushab</option>
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
                          <option value="Nawabshah">Nawabshah</option>
                          <option value="North Waziristan">
                            North Waziristan
                          </option>
                          <option value="Nasirabad/Tamboo">
                            Nasirabad/Tamboo
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
                          <option value="Sanghar">Sanghar</option>
                          <option value="Sargodha">Sargodha</option>
                          <option value="Shahdadkot">Shahdadkot</option>
                          <option value="Shaheed Banazir Abad">
                            Shaheed Banazir Abad
                          </option>
                          <option value="Shaheed Sikandar Abad">
                            Shaheed Sikandar Abad
                          </option>
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
                      Create
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
          <div className="xl:w-3/4 mt-20">
            <div className="bg-gray-100 py-2 px-5 rounded text-xs md:text-base mx-2 xl:mx-0">
              <h2 className="font-bold">Instructions</h2>
              <ul className="list-disc mt-4 list-inside">
                <li>Password must be at least 8 characters long.</li>
                <li>Password must contain at least one uppercase letter.</li>
                <li>Password must contain at least one lowercase letter.</li>
                <li>Password must contain at least one number.</li>
                <li>Password must contain at least one special character.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer />
    </>
  );
};

export default UserRegister;
