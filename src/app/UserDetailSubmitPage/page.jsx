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
  const [loading, setLoading] = useState(false);

  const getIconLimit = () => {
    if (formData.standee_type === "VCard 2 QR") return 2;
    const match = formData.standee_type?.match(/^\d+/);
    if (!match) return null;
    const qrCount = parseInt(match[0], 10);
    return qrCount <= 5 ? qrCount : null;
  };

  const shouldShowIcons = () => {
    return formData.standee_type && !["Business Card", "VCard"].includes(formData.standee_type);
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
    const iconLimit = getIconLimit();
    if (shouldShowIcons() && (!icons.length || icons.length < iconLimit)) {
      newErrors.icons = `Please select ${iconLimit} icon${iconLimit > 1 ? "s" : ""}`;
    }
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
        toast.warn(`Only ${iconLimit} icon${iconLimit > 1 ? "s" : ""} allowed`);
        return;
      }
      setIcons((prev) => [...prev, value]);
    } else {
      setIcons((prev) => prev.filter((i) => i !== value));
    }
    setErrors((prev) => ({ ...prev, icons: null, upi_qr: null }));
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    setStep(1);
  };

  const handleBack = () => setStep(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);

    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => form.append(k, v));
    form.append("icons_selected", icons.join(","));
    form.append("logo", logoFile);
    if (upiQR) form.append("upi_qr", upiQR);

    try {
      const res = await fetch("/api/userDataSubmit", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Form submitted successfully");
        setStep(0);
        setFormData({ name: "", phone: "", address: "", standee_type: "", other_icons: "" });
        setIcons([]);
        setLogoFile(null);
        setUpiQR(null);
        setErrors({});
      } else toast.error(json.message || "Submission failed");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4 flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
          <div className="loader">
            <span><span></span><span></span><span></span><span></span></span>
            <div className="base">
              <span></span>
              <div className="face"></div>
            </div>
          </div>
          <div className="longfazers">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      )}
      <div className="max-w-3xl w-full p-6 bg-white/70 backdrop-blur-md shadow-xl rounded-xl">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Apply For The Standee Design...</h2>

        {/* Stepper */}
        <div className="flex justify-between mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`mx-auto mb-2 h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                i === step ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"}`}>{i + 1}</div>
              <p className={`text-sm ${i === step ? "font-semibold text-blue-700" : "text-gray-500"}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-2">Step 1: General Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="border p-2 rounded w-full" />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div>
                <input type="text" name="phone" placeholder="WhatsApp Number" value={formData.phone} onChange={handleChange} className="border p-2 rounded w-full" />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
            </div>
            <input type="text" name="address" placeholder="Address (optional)" value={formData.address} onChange={handleChange} className="border p-2 rounded w-full" />

            <div>
              <label className="block font-medium mb-1 mt-4 text-blue-700">Upload Your Logo (Required)</label>
              <input type="file" accept="image/*" className="border p-2 rounded w-full" onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith("image/")) {
                  setTempLogoFile(file);
                  setLogoPreview(URL.createObjectURL(file));
                  setShowConfirmModal(true);
                } else toast.warn("Only image files allowed");
              }} />
              {errors.logo && <p className="text-red-500 text-sm">{errors.logo}</p>}
            </div>

            <div className="flex justify-end pt-6">
              <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <h3 className="text-xl font-semibold mb-2">Step 2: Standee Details</h3>

            <div>
              <select name="standee_type" value={formData.standee_type} onChange={handleChange} className="border p-2 rounded w-full">
                <option value="">Select Standee Type</option>
                {["1 QR Standee", "2 QR Standee", "3 QR Standee", "4 QR Standee", "5 QR Standee", "6 QR Standee", "7 QR Standee", "8 QR Standee", "3 QR Hrzntl Standee", "4 QR Hrzntl Standee", "5 QR Hrzntl Standee", "Business Card", "VCard", "VCard 2 QR"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.standee_type && <p className="text-red-500 text-sm">{errors.standee_type}</p>}
            </div>

            {shouldShowIcons() && (
              <>
                <p className="text-sm text-blue-600">You can choose up to {getIconLimit()} icon{getIconLimit() > 1 ? "s" : ""}.</p>
                <label className="block font-medium mt-2">Select Icons:</label>
                <p className="text-sm text-gray-500 mb-2">Selected {icons.length} icon(s)</p>
                <div className="flex flex-wrap gap-4">
                  {["Google", "Instagram", "UPI", "Facebook", "YouTube", "Whatsapp", "Website", "justdial"].map((icon) => (
                    <label key={icon} className="inline-flex items-center gap-2">
                      <input type="checkbox" value={icon} onChange={handleIconChange} checked={icons.includes(icon)}
                        disabled={getIconLimit() && !icons.includes(icon) && icons.length >= getIconLimit()} />
                      {icon}
                    </label>
                  ))}
                </div>
                {errors.icons && <p className="text-red-500 text-sm">{errors.icons}</p>}

                {icons.includes("UPI") && (
                  <div className="mt-4">
                    <label className="block font-medium">Upload UPI QR Code</label>
                    <input type="file" accept="image/*" className="border p-2 rounded w-full" onChange={(e) => setUpiQR(e.target.files[0])} />
                    {errors.upi_qr && <p className="text-red-500 text-sm">{errors.upi_qr}</p>}
                  </div>
                )}
                <input type="text" name="other_icons" value={formData.other_icons} placeholder="Other icons (optional)" className="border p-2 rounded w-full mt-2" onChange={handleChange} />
              </>
            )}

            <div className="flex justify-between pt-6">
              <button type="button" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400" onClick={handleBack}>Back</button>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Submit</button>
            </div>
          </form>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
         <style jsx>{`
        .loader {
          position: absolute;
          top: 50%;
          left: 50%;
          margin-left: -50px;
          animation: speeder 0.4s linear infinite;
        }
        .loader > span {
          height: 5px;
          width: 35px;
          background: #000;
          position: absolute;
          top: -19px;
          left: 60px;
          border-radius: 2px 10px 1px 0;
        }
        .base span {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-right: 100px solid #000;
          border-bottom: 6px solid transparent;
        }
        .base span:before {
          content: "";
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #000;
          position: absolute;
          right: -110px;
          top: -16px;
        }
        .base span:after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-top: 0 solid transparent;
          border-right: 55px solid #000;
          border-bottom: 16px solid transparent;
          top: -16px;
          right: -98px;
        }
        .face {
          position: absolute;
          height: 12px;
          width: 20px;
          background: #000;
          border-radius: 20px 20px 0 0;
          transform: rotate(-40deg);
          right: -125px;
          top: -15px;
        }
        .face:after {
          content: "";
          height: 12px;
          width: 12px;
          background: #000;
          right: 4px;
          top: 7px;
          position: absolute;
          transform: rotate(40deg);
          transform-origin: 50% 50%;
          border-radius: 0 0 0 2px;
        }
        .loader > span > span {
          width: 30px;
          height: 1px;
          background: #000;
          position: absolute;
        }
        .loader > span > span:nth-child(1) {
          animation: fazer1 0.2s linear infinite;
        }
        .loader > span > span:nth-child(2) {
          top: 3px;
          animation: fazer2 0.4s linear infinite;
        }
        .loader > span > span:nth-child(3) {
          top: 1px;
          animation: fazer3 0.4s linear infinite;
          animation-delay: -1s;
        }
        .loader > span > span:nth-child(4) {
          top: 4px;
          animation: fazer4 1s linear infinite;
          animation-delay: -1s;
        }
        @keyframes fazer1 {
          0% { left: 0; }
          100% { left: -80px; opacity: 0; }
        }
        @keyframes fazer2 {
          0% { left: 0; }
          100% { left: -100px; opacity: 0; }
        }
        @keyframes fazer3 {
          0% { left: 0; }
          100% { left: -50px; opacity: 0; }
        }
        @keyframes fazer4 {
          0% { left: 0; }
          100% { left: -150px; opacity: 0; }
        }
        @keyframes speeder {
          0% { transform: translate(2px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -3px) rotate(-1deg); }
          20% { transform: translate(-2px, 0px) rotate(1deg); }
          30% { transform: translate(1px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 3px) rotate(-1deg); }
          60% { transform: translate(-1px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-2px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 1px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .longfazers {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .longfazers span {
          position: absolute;
          height: 2px;
          width: 20%;
          background: #000;
        }
        .longfazers span:nth-child(1) {
          top: 20%;
          animation: lf 0.6s linear infinite;
          animation-delay: -5s;
        }
        .longfazers span:nth-child(2) {
          top: 40%;
          animation: lf2 0.8s linear infinite;
          animation-delay: -1s;
        }
        .longfazers span:nth-child(3) {
          top: 60%;
          animation: lf3 0.6s linear infinite;
        }
        .longfazers span:nth-child(4) {
          top: 80%;
          animation: lf4 0.5s linear infinite;
          animation-delay: -3s;
        }
        @keyframes lf {
          0% { left: 200%; }
          100% { left: -200%; opacity: 0; }
        }
        @keyframes lf2 {
          0% { left: 200%; }
          100% { left: -200%; opacity: 0; }
        }
        @keyframes lf3 {
          0% { left: 200%; }
          100% { left: -100%; opacity: 0; }
        }
        @keyframes lf4 {
          0% { left: 200%; }
          100% { left: -100%; opacity: 0; }
        }
      `}</style>
      </div>

      {/* Logo Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">Confirm Image Upload</h2>
            <p className="mb-2">Are you sure you want to upload this image?</p>
            <p className="text-sm text-gray-600 mb-4">{tempLogoFile?.name}</p>
            {logoPreview && <Image src={logoPreview} alt="Preview" width={200} height={200} className="mx-auto mb-4 rounded" />}
            <div className="flex justify-center gap-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => {
                setLogoFile(tempLogoFile);
                setShowConfirmModal(false);
              }}>OK</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={() => {
                setTempLogoFile(null);
                setLogoPreview(null);
                setShowConfirmModal(false);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
