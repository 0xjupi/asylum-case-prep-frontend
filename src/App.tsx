import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataModeProvider } from "@/context/DataModeContext";
import { AppShell } from "@/components/layout/AppShell";
import {
  Dashboard,
  MyCase,
  InterviewTranscript,
  DocumentsEvidence,
  MockHearing,
  BamfSimulation,
  LawyerReview,
  JudgeEvaluation,
  CountryInformation,
  LegalSources,
  PreviousSessions,
  Settings,
  NotFound,
} from "@/pages";

export default function App() {
  return (
    <DataModeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="case" element={<MyCase />} />
            <Route path="transcript" element={<InterviewTranscript />} />
            <Route path="documents" element={<DocumentsEvidence />} />
            <Route path="hearing" element={<MockHearing />} />
            <Route path="hearing/bamf" element={<BamfSimulation />} />
            <Route path="hearing/lawyer" element={<LawyerReview />} />
            <Route path="hearing/judge" element={<JudgeEvaluation />} />
            <Route path="country-information" element={<CountryInformation />} />
            <Route path="legal-sources" element={<LegalSources />} />
            <Route path="sessions" element={<PreviousSessions />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataModeProvider>
  );
}
