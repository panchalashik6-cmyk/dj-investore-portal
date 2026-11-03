import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Questionnaire from "./pages/Questionnaire";
import Advisors from "./pages/Advisors";
import Meetings from "./pages/Meetings";
import Activity from "./pages/Activity";
export default function App() {
 return <AppProvider><Routes><Route element={<Layout/>}><Route index element={<Overview/>}/><Route path="questionnaire" element={<Questionnaire/>}/><Route path="advisors" element={<Advisors/>}/><Route path="meetings" element={<Meetings/>}/><Route path="activity" element={<Activity/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes></AppProvider>;
}