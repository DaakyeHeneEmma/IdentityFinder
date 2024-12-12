"use client"

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
// import { Metadata } from "next";
import SelectGroupOne from "@/components/SelectGroup/SelectGroupOne";
import Skeleton from "@/components/Layouts/Skeleton";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import db from "@/app/lib/firestore";

// export const metadata: Metadata = {
//   title: "Identity",
//   description: "Report Card Lost",
// };

const FoundLostCard = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "items"), {
        name,
        phoneNumber,
        email,
        category,
        createdAt: new Date(),
      });

      setName("");
      setPhoneNumber("");
      setEmail("");
      setCategory("");
      alert("Document added successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error adding document");
    }
  };

  return (
    <Skeleton>
      <Breadcrumb pageName="Found Lost Card" />

      <div className="sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* <!-- Contact Form --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Contact Form
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Your Full Name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Email <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <SelectGroupOne />

                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    ID Description
                  </label>
                  <textarea
                    rows={6}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Type your message"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
                </div>

                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Skeleton>
  );
};

export default FoundLostCard;
