// Theme toggle
(function () {
	const root = document.documentElement;
	root.classList.add("js");
	const stored = (() => {
		try {
			return null;
		} catch {
			return null;
		}
	})(); // localStorage blocked in sandbox
	const prefersDark =
		window.matchMedia &&
		window.matchMedia("(prefers-color-scheme: dark)").matches;
	if (prefersDark) root.setAttribute("data-theme", "dark");

	const btn = document.querySelector(".theme-toggle");
	if (btn) {
		btn.addEventListener("click", () => {
			const next =
				root.getAttribute("data-theme") === "dark" ? "light" : "dark";
			if (next === "dark") root.setAttribute("data-theme", "dark");
			else root.removeAttribute("data-theme");
		});
	}

	// Mobile nav
	const menuBtn = document.querySelector(".menu-toggle");
	const navLinks = document.querySelector(".nav-links");
	if (menuBtn && navLinks) {
		menuBtn.addEventListener("click", () => {
			const isOpen = navLinks.classList.toggle("open");
			menuBtn.setAttribute("aria-expanded", isOpen);
		});
		navLinks.querySelectorAll("a").forEach((a) =>
			a.addEventListener("click", () => {
				navLinks.classList.remove("open");
				menuBtn.setAttribute("aria-expanded", "false");
			}),
		);
	}

	// Scroll reveal
	const reveals = document.querySelectorAll(".reveal");
	const revealAll = () => reveals.forEach((el) => el.classList.add("in"));
	if ("IntersectionObserver" in window && reveals.length) {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("in");
						io.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.05, rootMargin: "0px 0px 100px 0px" },
		);
		reveals.forEach((el) => io.observe(el));
		// Safety fallback: reveal anything still hidden after 2s
		setTimeout(revealAll, 2000);
	} else {
		revealAll();
	}

	// Footer year
	const yr = document.querySelector("[data-year]");
	if (yr) yr.textContent = new Date().getFullYear();
})();
