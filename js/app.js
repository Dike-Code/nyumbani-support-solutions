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
// Floating WhatsApp button — injected on every page
// =====================================================================
// (function () {
// 	// Skip injection if a page has already declared its own (none currently do)
// 	if (document.querySelector(".wa-float")) return;

// 	const WA_NUMBER_INTL = "254707110347"; // E.164 without +
// 	const WA_GREETING = encodeURIComponent(
// 		"Hello Nyumbani — I'm interested in learning more about your in-home care services.",
// 	);
// 	const WA_URL = `https://wa.me/${WA_NUMBER_INTL}?text=${WA_GREETING}`;

// 	function inject() {
// 		const a = document.createElement("a");
// 		a.className = "wa-float";
// 		a.href = WA_URL;
// 		a.target = "_blank";
// 		a.rel = "noopener noreferrer";
// 		a.setAttribute(
// 			"aria-label",
// 			"Chat with Nyumbani Support Solutions on WhatsApp",
// 		);
// 		a.innerHTML = `
//       <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
//         <path d="M20.52 3.48A11.94 11.94 0 0 0 12.05 0C5.45 0 .08 5.37.08 11.97c0 2.11.55 4.17 1.6 5.98L0 24l6.2-1.63a11.97 11.97 0 0 0 5.85 1.49h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.19-1.24-6.19-3.51-8.41zM12.06 21.84h-.01a9.91 9.91 0 0 1-5.05-1.38l-.36-.21-3.68.97.98-3.59-.24-.37a9.9 9.9 0 0 1-1.52-5.29c0-5.48 4.47-9.94 9.96-9.94 2.66 0 5.16 1.04 7.04 2.92a9.86 9.86 0 0 1 2.91 7.04c0 5.48-4.46 9.95-9.95 9.95zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07s-1.26-.46-2.4-1.48a8.99 8.99 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.11 3.22 5.12 4.51.71.31 1.27.49 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/>
//       </svg>
//       <span class="wa-label">Chat on WhatsApp</span>
//     `;
// 		document.body.appendChild(a);
// 	}

// 	if (document.readyState === "loading") {
// 		document.addEventListener("DOMContentLoaded", inject);
// 	} else {
// 		inject();
// 	}
// })();

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

	// Honeypot check
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

		// no-cors responses are opaque — we treat any non-throw as success
		if (onSuccess) onSuccess();
	} catch (err) {
		console.error("MailerLite subscribe error:", err);
		if (onError) onError(err);
	}
};

// =====================================================================
// Wire up forms automatically — opt-in via [data-ml-form]
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll("form[data-ml-form]").forEach((form) => {
		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			const formId = form.dataset.mlFormId;
			const groupId = form.dataset.mlGroupId;
			const successEl = form.parentElement.querySelector(".form-success");
			const errorEl = form.parentElement.querySelector(".form-error");
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

			if (errorEl) errorEl.style.display = "none";
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
