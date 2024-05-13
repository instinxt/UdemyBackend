const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db");

// User Routes
router.post("/signup", async (req, res) => {
	// Implement user signup logic
	const { username, password } = req.body;
	const existingUser = await User.findOne({ username });
	if (existingUser) {
		res.status(400).json({ message: "Username already exists" });
	} else {
		await User.create({ username, password });
		res.json({ message: "User created successfully" });
	}
});

router.get("/courses", async (req, res) => {
	// Implement listing all courses logic
	const response = await Course.find({});
	res.json({ courses: response });
});

router.post("/courses/:courseId", userMiddleware, async (req, res) => {
	// Implement course purchase logic
	const { courseId } = req.params;
	const course = await Course.findById(courseId);

	if (course) {
		const user = await User.findOne({ username: req.headers.username });

		//Check if course already bought
		if (user.purchasedCourses.includes(course._id)) {
			res.status(400).json({ message: "You already have this course" });
			return;
		}

		user.purchasedCourses.push(course._id);
		await user.save();

		res.json({ message: "Course purchased successfully" });
	} else {
		res.status(500).json({ message: "Something went wrong" });
	}
});

router.get("/purchasedCourses", userMiddleware, async (req, res) => {
	// Implement fetching purchased courses logic
	const { username } = req.headers;

	const user = await User.findOne({ username }).populate("purchasedCourses");
	res.status(200).json({ courses: user.purchasedCourses });
});

module.exports = router;
