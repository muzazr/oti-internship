import { ClassCard } from "@/components/guru/dashboard/classes/class-card";
import { CreateClassCard } from "@/components/guru/dashboard/classes/create-class-card";
import { mockClasses } from "@/lib/data/mock-classes";

export const metadata = {
  title: "Classes - MitBridge",
  description: "Manage your classes on MitBridge Educator Portal",
};

export default function ClassesPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#191B23]">Classes Overview</h1>
        <p className="text-base text-[#565F6B]">
          Berikut kelas anda, silahkan menambahkan kelas apabila diperlukan
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {mockClasses.map((classData) => (
          <ClassCard key={classData.id} classData={classData} />
        ))}
        <CreateClassCard />
      </div>
    </div>
  );
}
