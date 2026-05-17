// =====================================================================
// Nyumbani Support Solutions — app.js
// =====================================================================
// Includes:
//   1. Theme toggle (light/dark)
//   2. Mobile nav
//   3. Scroll reveal
//   4. Footer year
//   5. WhatsApp floating button injector (site-wide)
//   6. MailerLite subscribe helper (forms wired via shared endpoint)
// =====================================================================

(function () {
	const root = document.documentElement;
	root.classList.add("js");

	// Dark mode preference
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
		setTimeout(revealAll, 2000);
	} else {
		revealAll();
	}

	// Footer year
	const yr = document.querySelector("[data-year]");
	if (yr) yr.textContent = new Date().getFullYear();
})();

// =====================================================================
// Floating WhatsApp button — handled by inline HTML (.whatsapp-fab) on
// every page. JS injection removed to avoid duplicate unstyled markup.
// =====================================================================

// =====================================================================
// MailerLite subscribe helper — used by all forms on the site
// =====================================================================
// The dev team will replace these REPLACE_WITH_* placeholders with real
// MailerLite IDs once the account is approved. See README-DEV.md.
// =====================================================================
window.nyumbaniMlSubscribe = async function ({
	formId,
	groupId,
	data,
	onSuccess,
	onError,
}) {
	const ACCOUNT_ID = "REPLACE_WITH_MAILERLITE_ACCOUNT_ID";
	const endpoint = `https://assets.mailerlite.com/jsonp/${ACCOUNT_ID}/forms/${formId}/subscribe`;

	if (data._gotcha) {
		if (onSuccess) onSuccess();
		return;
	}

	try {
		const payload = new URLSearchParams();
		payload.append("fields[email]", data.email || "");
		if (data.first_name) payload.append("fields[name]", data.first_name);
		if (data.last_name) payload.append("fields[last_name]", data.last_name);
		if (data.phone) payload.append("fields[phone]", data.phone);
		if (data.care_needed)
			payload.append("fields[care_needed]", data.care_needed);
		if (data.city) payload.append("fields[city]", data.city);
		if (data.message) payload.append("fields[message]", data.message);
		if (groupId) payload.append("groups[]", groupId);
		payload.append("ml-submit", "1");
		payload.append("anticsrf", "true");

		await fetch(endpoint, {
			method: "POST",
			mode: "no-cors",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: payload.toString(),
		});

		if (onSuccess) onSuccess();
	} catch (err) {
		console.error("MailerLite subscribe error:", err);
		if (onError) onError(err);
	}
};

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll("form[data-ml-form]").forEach((form) => {
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const formId = form.dataset.mlFormId;
			const groupId = form.dataset.mlGroupId;

			// Safe DOM traversal that doesn't rely on wrapper divs
			const errorEl = form.querySelector(".form-error");
			const successEl =
				(
					form.nextElementSibling &&
					form.nextElementSibling.classList.contains("form-success")
				) ?
					form.nextElementSibling
				:	form.parentElement.querySelector(".form-success");

			const submitBtn = form.querySelector('button[type="submit"]');

			const fd = new FormData(form);
			const data = {
				first_name: (fd.get("first_name") || "").toString().trim(),
				last_name: (fd.get("last_name") || "").toString().trim(),
				email: (fd.get("email") || "").toString().trim(),
				phone: (fd.get("phone") || "").toString().trim(),
				care_needed: (fd.get("care_needed") || "").toString().trim(),
				city: (fd.get("city") || "").toString().trim(),
				message: (fd.get("message") || "").toString().trim(),
				_gotcha: (fd.get("_gotcha") || "").toString().trim(),
			};

			// Clear previous states
			if (errorEl) {
				errorEl.style.display = "none";
				errorEl.textContent = "";
			}

			// Validation Logic
			let validationErrors = [];

			if (!data.first_name)
				validationErrors.push("First name is required.");
			if (!data.last_name)
				validationErrors.push("Last name is required.");

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!data.email) {
				validationErrors.push("Email address is required.");
			} else if (!emailRegex.test(data.email)) {
				validationErrors.push("Please enter a valid email address.");
			}

			// Stop execution if errors are caught
			if (validationErrors.length > 0) {
				if (errorEl) {
					errorEl.innerHTML = validationErrors.join("<br>");
					errorEl.style.display = "block";
				}
				return;
			}

			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.dataset.origLabel = submitBtn.textContent;
				submitBtn.textContent = "Sending…";
			}

			await window.nyumbaniMlSubscribe({
				formId,
				groupId,
				data,
				onSuccess: () => {
					form.style.display = "none";
					if (successEl) successEl.style.display = "block";
					if (submitBtn) {
						submitBtn.disabled = false;
						submitBtn.textContent =
							submitBtn.dataset.origLabel || "Submit";
					}
				},
				onError: () => {
					if (errorEl) {
						errorEl.textContent =
							"Something went wrong sending your message. Please email info@nyumbanisupportsolutions.com directly.";
						errorEl.style.display = "block";
					}
					if (submitBtn) {
						submitBtn.disabled = false;
						submitBtn.textContent =
							submitBtn.dataset.origLabel || "Submit";
					}
				},
			});
		});
	});
});
