"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";

const steps = ["General Info", "Standee Details"];

export default function StepperForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    standee_type: "",
    other_icons: "",
  });
  const [errors, setErrors] = useState({});
  const [icons, setIcons] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [upiQR, setUpiQR] = useState(null);
  const [tempLogoFile, setTempLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getIconLimit = () => {
    if (formData.standee_type === "VCard 2 QR") return 2;
    const match = formData.standee_type?.match(/^\d+/);
    if (!match) return null;
    const qrCount = parseInt(match[0], 10);
    return qrCount <= 5 ? qrCount : null;
  };

  const shouldShowIcons = () => {
    const hideTypes = ["Business Card", "VCard"];
    return formData.standee_type && !hideTypes.includes(formData.standee_type);
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = "Phone must be 10 digits";
    if (!logoFile) newErrors.logo = "Logo file is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.standee_type) newErrors.standee_type = "Please select a standee type";
    if (shouldShowIcons() && icons.length === 0) newErrors.icons = "Please select at least one icon";
    if (icons.includes("UPI") && !upiQR) newErrors.upi_qr = "Please upload UPI QR code";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    if (name === "standee_type") setIcons([]);
  };

  const handleIconChange = (e) => {
    const { value, checked } = e.target;
    const iconLimit = getIconLimit();

    if (checked) {
      if (iconLimit && icons.length >= iconLimit) {
        toast.warn(`You can select up to ${iconLimit} icon(s) only.`);
        return;
      }
      setIcons((prev) => [...prev, value]);
    } else {
      setIcons((prev) => prev.filter((icon) => icon !== value));
    }
    setErrors((prev) => ({ ...prev, icons: null, upi_qr: null }));
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => form.append(key, value));
    form.append("icons_selected", icons.join(","));
    form.append("logo", logoFile);
    if (upiQR) form.append("upi_qr", upiQR);

    try {
      const res = await fetch("/api/userDataSubmit", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Form submitted successfully");
        setStep(0);
        setFormData({ name: "", phone: "", address: "", standee_type: "", other_icons: "" });
        setIcons([]);
        setLogoFile(null);
        setUpiQR(null);
        setErrors({});
      } else {
        toast.error(json.message || "Submission failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4 flex items-center justify-center">
      <div className="max-w-3xl w-full p-6 bg-white/70 backdrop-blur-md shadow-xl rounded-xl">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Apply For The Standee Design</h2>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className={`mx-auto mb-2 h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                  i === step ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"
                }`}
              >
                {i + 1}
              </div>
              <p className={`text-sm ${i === step ? "font-semibold text-blue-700" : "text-gray-500"}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-2">Step 1: General Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="phone"
                  placeholder="WhatsApp Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
            <input
              type="text"
              name="address"
              placeholder="Address (optional)"
              value={formData.address}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <div>
              <label className="block font-medium mb-1 mt-4 text-blue-700">Upload Your Logo (Required)</label>
              <input
                type="file"
                accept="image/*"
                className="border p-2 rounded w-full"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (!file.type.startsWith("image/")) {
                      toast.warn("Only image files are allowed");
                      return;
                    }
                    setTempLogoFile(file);
                    setLogoPreview(URL.createObjectURL(file));
                    setShowConfirmModal(true);
                  }
                }}
              />
              {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <h3 className="text-xl font-semibold mb-2">Step 2: Standee Details</h3>

            <div>
              <select
                name="standee_type"
                value={formData.standee_type}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Standee Type</option>
                {["1 QR Standee", "2 QR Standee", "3 QR Standee", "4 QR Standee", "5 QR Standee", "6 QR Standee", "7 QR Standee", "8 QR Standee", "3 QR Hrzntl Standee", "4 QR Hrzntl Standee", "5 QR Hrzntl Standee", "Business Card", "VCard", "VCard 2 QR"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.standee_type && <p className="text-red-500 text-sm mt-1">{errors.standee_type}</p>}
            </div>

            {getIconLimit() && (
              <p className="text-sm text-blue-600 mt-1">
                You can choose up to {getIconLimit()} icon{getIconLimit() > 1 ? "s" : ""}.
              </p>
            )}

            {shouldShowIcons() && (
              <div>
                <label className="block font-medium mb-1">Select Icons:</label>
                <p className="text-sm text-gray-500 mb-2">Selected {icons.length} icon(s)</p>
                <div className="flex flex-wrap gap-4">
                  {["Google", "Instagram", "UPI", "Facebook", "YouTube", "Whatsapp", "Website", "justdial"].map((icon) => (
                    <label key={icon} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={icon}
                        onChange={handleIconChange}
                        checked={icons.includes(icon)}
                        disabled={
                          getIconLimit() !== null &&
                          !icons.includes(icon) &&
                          icons.length >= getIconLimit()
                        }
                      />
                      {icon}
                    </label>
                  ))}
                </div>

                {icons.includes("UPI") && (
                  <div className="mt-4">
                    <label className="block font-medium mb-1">Upload UPI QR Code (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="border p-2 rounded w-full"
                      onChange={(e) => setUpiQR(e.target.files[0])}
                    />
                  </div>
                )}

                <input
                  type="text"
                  name="other_icons"
                  value={formData.other_icons}
                  placeholder="Other icons (optional)"
                  className="border p-2 rounded w-full mt-2"
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="flex justify-between pt-6">
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Submit
              </button>
            </div>
          </form>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">Confirm Image Upload</h2>
            <p className="mb-2">Are you sure you want to upload this image?</p>
            <p className="text-sm text-gray-600 mb-4">{tempLogoFile?.name}</p>
            {logoPreview && (
              <Image src={logoPreview} alt="Preview" width={200} height={200} className="mx-auto mb-4 rounded" />
            )}
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => {
                  setLogoFile(tempLogoFile);
                  setShowConfirmModal(false);
                }}
              >
                OK
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => {
                  setTempLogoFile(null);
                  setLogoPreview(null);
                  setShowConfirmModal(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
