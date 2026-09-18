import React from "react";

export default function AddressForm({ value, onChange }) {
  const set = (key, val) => {
    onChange({
      ...value,
      [key]: val,
    });
  };

  const inputClass =
    "mt-2 block w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";

  const labelClass =
    "block w-full text-sm font-semibold text-gray-700";

  return (
    <div className="form-card">
      <h3>Delivery Address</h3>

      <div className="form-grid">

        <label className={labelClass}>
          Full Name
          <input
            className={inputClass}
            type="text"
            value={value.name || ""}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </label>

        <label className={labelClass}>
          Phone
          <input
            className={inputClass}
            type="tel"
            value={value.phone || ""}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="03XX XXXXXXX"
            required
          />
        </label>

        <label className={`${labelClass} wide`}>
          Address
          <input
            className={inputClass}
            type="text"
            value={value.address || ""}
            onChange={(e) => set("address", e.target.value)}
            placeholder="House no, street, area"
            required
          />
        </label>

        <label className={labelClass}>
          City
          <input
            className={inputClass}
            type="text"
            value={value.city || ""}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Enter city"
            required
          />
        </label>

        <label className={labelClass}>
          Postal Code
          <input
            className={inputClass}
            type="text"
            value={value.postalCode || ""}
            onChange={(e) => set("postalCode", e.target.value)}
            placeholder="Postal code"
          />
        </label>

      </div>
    </div>
  );
}