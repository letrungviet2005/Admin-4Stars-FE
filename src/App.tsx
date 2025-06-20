import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import Grammar from "./pages/Grammar/Grammar";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import User from "./pages/User/User";
import Member from "./pages/Member/Member";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Vocabulary from "./pages/Vocabulary/Vocabulary";
import Article from "./pages/ArticleAndVideos/Article";
import Categories from "./pages/Vocabulary/Categories";
import Admin from "./pages/Admin/Admin";
import Video from "./pages/ArticleAndVideos/Video";
import "../src/authentication/authentication";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/grammar" element={<Grammar />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/member" element={<Member />} />

            {/* Forms */}
            <Route path="/article" element={<Article />} />

            {/* Tables */}
            <Route path="/user" element={<User />} />
            <Route path="/admin" element={<Admin />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Video />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
