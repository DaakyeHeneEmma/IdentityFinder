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
  const [cardOption, setCardOption] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phoneNumber || !email || !category || !cardOption) {
        alert("Please fill in all required fields."); 
        return; 
    }

    setShowConfirm(true); 
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);

    try {
      await addDoc(collection(db, "items"), {
        name,
        phoneNumber,
        email,
        category,
        cardOption,
        createdAt: new Date(),
      });

      setName("");
      setPhoneNumber("");
      setEmail("");
      setCategory("");
      setCardOption("")
      alert("Document added successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error adding document");
    }
  };

  const cancelSubmit = () => {
    setShowConfirm(false);
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

                <SelectGroupOne 
                  selectedOption={cardOption}
                  onSelectChange={setCardOption}
                />

                <div className="mb-4.5">
                          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white">
                          File upload
                        </h3>
                      </div>
                      <div className="flex flex-col gap-5.5 p-6.5">
                        <div>
                          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Attach file
                          </label>
                          <input
                            type="file"
                            className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                </div>

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
                  SUBMIT
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-20 rounded shadow-lg z-60">
            <h3 className="font-medium text-black ">Confirm Submission</h3>
            
            <ul>
              <li>Name: {name}</li>
              <li>Phone Number: {phoneNumber}</li>
              <li>Email: {email}</li>
              <li>Category: {category}</li>
              <li>Card Option: {cardOption}</li>
        
            </ul>
            <div className="flex justify-end mt-4">
              <button onClick={cancelSubmit} className="mr-10 bg-gray-300 p-2 rounded">Cancel</button>
              <button onClick={confirmSubmit} className="bg-primary p-2 rounded text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </Skeleton>
  );
};

export default FoundLostCard;
