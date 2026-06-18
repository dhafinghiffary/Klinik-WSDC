import { PageHeader } from "@/components/shared/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BranchesTab } from "./tabs/BranchesTab"
import { DoctorsTab } from "./tabs/DoctorsTab"
import { TreatmentsTab } from "./tabs/TreatmentsTab"
import { ConditionsTab } from "./tabs/ConditionsTab"
import { UsersTab } from "./tabs/UsersTab"

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Pengaturan & Master Data" description="Kelola data dasar sistem klinik." />

      <Tabs defaultValue="branches">
        <TabsList className="flex-wrap">
          <TabsTrigger value="branches">Cabang</TabsTrigger>
          <TabsTrigger value="doctors">Dokter</TabsTrigger>
          <TabsTrigger value="treatments">Tindakan &amp; Tarif</TabsTrigger>
          <TabsTrigger value="conditions">Odontogram</TabsTrigger>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
        </TabsList>

        <TabsContent value="branches">
          <BranchesTab />
        </TabsContent>
        <TabsContent value="doctors">
          <DoctorsTab />
        </TabsContent>
        <TabsContent value="treatments">
          <TreatmentsTab />
        </TabsContent>
        <TabsContent value="conditions">
          <ConditionsTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
