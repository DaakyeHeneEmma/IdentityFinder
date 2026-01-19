"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SelectGroupOne from "@/components/SelectGroup/SelectGroupOne";
import Skeleton from "@/components/Layouts/Skeleton";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import { CreateReportCardRequest } from "@/types/reportCard";

// export const metadata: Metadata = {
//   title: "Identity",
//   description:
//     "Report Card Lost",
// };

const FormLayout = () => {
  const { user, getIdToken } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [formData, setFormData] = useState<CreateReportCardRequest>({
    fullName: "",
    phone: "",
    email: "",
    idType: "",
    idDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSelectChange = (value: string) => {
    setSelectedOption(value);
    setFormData((prev) => ({ ...prev, idType: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.idType.trim()) {
      setSubmitMessage("ID type is required");
      return false;
    }

    if (!formData.idDescription.trim()) {
      errors.idDescription = "ID description is required";
    } else if (formData.idDescription.trim().length < 10) {
      errors.idDescription = "Description must be at least 10 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      setSubmitMessage("Please sign in to submit a report");
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const idToken = await getIdToken();
      if (!idToken) {
        setSubmitMessage("Authentication required");
        return;
      }

      const requestData = {
        ...formData,
      };

      const response = await fetch("/api/report-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage("Report submitted successfully!");
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          idType: "",
          idDescription: "",
          fileDescription: "",
        });
        setSelectedOption("");
      } else {
        setSubmitMessage(result.error || "Failed to submit report");
      }
    } catch (error) {
      setSubmitMessage("An error occurred while submitting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Skeleton>
      <Breadcrumb pageName="Lost Identity" />

      <div className="sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* <!-- Contact Form --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Contact Form
              </h3>
            </div>
            <form action="#" onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter Your Full Name"
                      className={`w-full rounded border-[1.5px] bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:bg-form-input dark:text-white dark:focus:border-primary ${
                        fieldErrors.fullName
                          ? "border-red-500"
                          : "border-stroke"
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className={`w-full rounded border-[1.5px] bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:bg-form-input dark:text-white dark:focus:border-primary ${
                        fieldErrors.phone ? "border-red-500" : "border-stroke"
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Email <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className={`w-full rounded border-[1.5px] bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:bg-form-input dark:text-white dark:focus:border-primary ${
                      fieldErrors.email ? "border-red-500" : "border-stroke"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    File Description
                  </label>
                  <input
                    type="text"
                    name="fileDescription"
                    value={formData.fileDescription || ""}
                    onChange={handleInputChange}
                    placeholder="Describe the file or reference (optional)"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <SelectGroupOne
                  selectedOption={selectedOption}
                  onSelectChange={handleSelectChange}
                />

                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    ID Description
                  </label>
                  <textarea
                    name="idDescription"
                    value={formData.idDescription}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Type your message"
                    className={`w-full rounded border-[1.5px] bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:bg-form-input dark:text-white dark:focus:border-primary ${
                      fieldErrors.idDescription
                        ? "border-red-500"
                        : "border-stroke"
                    }`}
                  ></textarea>
                  {fieldErrors.idDescription && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.idDescription}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Report Lost Card"}
                </button>

                {submitMessage && (
                  <div
                    className={`mt-4 rounded p-3 text-sm ${
                      submitMessage.includes("success")
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </Skeleton>
  );
};

export default FormLayout;
