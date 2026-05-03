"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface AddMemberFormProps {
  onSubmit: (fullName: string, whatsappNumber: string) => Promise<void>;
  isLoading: boolean;
}

export function AddMemberForm({ onSubmit, isLoading }: AddMemberFormProps) {
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !whatsappNumber.trim()) return;
    await onSubmit(fullName.trim(), whatsappNumber.trim());
    setFullName("");
    setWhatsappNumber("");
  };

  return (
    <div className="bg-white rounded-xl p-6 w-[325px]">
      <h3 className="text-xl font-bold text-[#191B23] mb-5">Add New Member</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nama Lengkap */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#424654]">Nama Lengkap</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama Lengkap"
            className="h-12 px-3 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg text-base text-[#191B23] placeholder:text-[#8C8D91] outline-none focus:border-[#003FA3] transition-colors"
            required
          />
        </div>

        {/* WhatsApp Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#424654]">WhatsApp Number</label>
          <div className="flex h-12 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg overflow-hidden focus-within:border-[#003FA3] transition-colors">
            <span className="flex items-center px-3 text-base text-[#424654] border-r border-[#C3C6D7] bg-white">
              +62
            </span>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="812 3456 7890"
              className="flex-1 px-3 bg-transparent text-base text-[#191B23] placeholder:text-[#8C8D91] outline-none"
              required
            />
          </div>
        </div>

        {/* Role Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#424654]">Role Selection</label>
          <select
            className="h-12 px-3 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg text-base text-[#191B23] outline-none focus:border-[#003FA3] transition-colors appearance-none cursor-pointer"
            defaultValue="student"
          >
            <option value="student">Student</option>
          </select>
        </div>

        {/* Send Invite Button */}
        <button
          type="submit"
          disabled={isLoading || !fullName.trim() || !whatsappNumber.trim()}
          className="h-12 bg-[#0055D4] rounded-lg text-base text-white hover:bg-[#0048B8] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Send Invite
        </button>
      </form>
    </div>
  );
}
