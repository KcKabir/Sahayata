import bodyParser from "body-parser";
import session from "express-session";
import pg from "pg";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const popularSkills = [
  { key: "mansory", label: "Mansory", icon: "👨‍🔧" },
  { key: "plumbing", label: "Plumbing", icon: "🛠" },
  { key: "carpentry", label: "Carpentry", icon: "🪚" },
  { key: "electrical", label: "Electrical", icon: "⚡" },
  { key: "painting", label: "Painting", icon: "🎨" },
  { key: "gardening", label: "Gardening", icon: "🌺" },
];

const JOBS = [
  {
    id: "Job-01",
    title: "Construction Helper Needed",
    location: "Gurgaon, Haryana",
    pay: "500.00rs/day",
    tags: ["Mansory", "Physical Work"],
    posted: "About 2 days ago",
    duration: "2 weeks",
    description:
      "Need 2 experienced construction workers for building projects",
  },
  {
    id: "Job-02",
    title: "Plumbing Repair work",
    location: "Noida, UP",
    pay: "800.00rs/day",
    tags: ["Plumbing", "Pipe Repair"],
    posted: "About 7 hours ago",
    duration: "3 days",
    description:
      "Urgent plumbing repair needed in residential complex. Experience with pipe fitting required.",
  },
  {
    id: "Job-03",
    title: "House Painting Project",
    location: "Delhi, NCR",
    pay: "600.00rs/day",
    tags: ["Painting", "Interior Design"],
    posted: "1 day ago",
    duration: "1 week",
    description:
      "Interior and exterior painting work for 3BHK house. Must bring own brushes and basic equipments",
  },
];

app.use((req, res, next) => {
  res.locals.popularSkills = popularSkills;
  res.locals.now = dayjs();
  next();
});

app.get("/", (req, res) => {
  res.render("index", { latestJobs: JOBS.slice(0, 3) });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/services", (req, res) => {
  res.render("services", { title: "Services" });
});

app.get("/donate", (req, res) => {
  res.render("donate", { title: "Donate" });
});

app.post("/donate", (req, res) => {
  const { name, amount } = req.body;
  if (!name || !amount) {
    return res.render("donate", { title: "Donate", error: "Please fill all fields." });
  }
  res.render("success", { title: "Donation Success", name, amount });
});

app.get("/volunteer", (req, res) => {
  res.render("volunteer", { title: "Volunteer" });
});

app.post("/volunteer", (req, res) => {
  const { name, skills, availability } = req.body;
  if (!name) {
    return res.render("volunteer", { title: "Volunteer", error: "Name is required." });
  }
  res.render("success", { title: "Volunteer Success", name, skills, availability });
});

app.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact" });
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.render("contact", { title: "Contact", error: "Please fill all fields." });
  }
  res.render("success", { title: "Message Sent", name, email, message });
});

app.get("/jobs", (req, res) => {
  const { q = "", skill = "" } = req.query;
  let results = JOBS;

  if (q) {
    const needle = q.toLowerCase();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(needle) ||
        j.location.toLowerCase().includes(needle) ||
        j.description.toLowerCase().includes(needle)
    );
  }

  if (skill) {
    results = results.filter((j) =>
      j.tags.map((t) => t.toLowerCase()).includes(skill.toLowerCase())
    );
  }

  res.render("jobs", { jobs: results, q, skill });
});

app.get("/jobs/:id", (req, res) => {
  const job = JOBS.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).render("404");
  res.render("job", { job });
});

app.post("/apply", (req, res) => {
  const { jobId, name, phone } = req.body;
  const job = JOBS.find((j) => j.id === jobId);

  if (!job) return res.status(404).render("404");
  if (!name || !phone) {
    return res.render("job", {
      job,
      error: "Please provide both name and phone number",
    });
  }
  res.render("success", { job, name, phone });
});

app.get("/work", (req, res) => {
  res.redirect("/jobs");
});

app.get("/hire", (req, res) => {
  res.render("hire");
});

app.post("/hire", (req, res) => {
  const { title, location, pay, tags, duration, description } = req.body;

  if (!title || !location || !pay) {
    return res.render("hire", { error: "Please fill properly." });
  }

  const NewJob = {
    id: `Job-${Date.now()}`,
    title,
    location,
    pay,
    tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    posted: dayjs().fromNow(),
    duration: duration || "Not specified",
    description: description || "",
  };

  JOBS.unshift(NewJob);
  res.redirect("/jobs");
});

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(port, () => {
  console.log("IT WORKS");
});
