// =====================================================================
// Nyumbani Support Solutions — app.js
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
// MailerLite subscribe helper — used by all forms on the site
// =====================================================================
window.nyumbaniMlSubscribe = function ({ formId, groupId, data }) {
	const ACCOUNT_ID = "2342537";
	const endpoint = `https://assets.mailerlite.com/jsonp/${ACCOUNT_ID}/forms/${formId}/subscribe`;

	if (data._gotcha) {
		return Promise.resolve({ success: true, mock: true });
	}

	const params = new URLSearchParams();

	// Core Subscriber Fields
	params.append("fields[email]", data.email || "");
	if (data.first_name) params.append("fields[name]", data.first_name);
	if (data.last_name) params.append("fields[last_name]", data.last_name);

	if (groupId) params.append("groups[]", groupId);

	// Required MailerLite Webform Engine Flags
	params.append("ajax", "1");
	params.append("ml-submit", "1");
	params.append("anticsrf", "true");

	return new Promise((resolve) => {
		const callbackName = "ml_jsonp_" + Math.round(100000 * Math.random());

		window[callbackName] = function (response) {
			delete window[callbackName];
			document.body.removeChild(script);
			resolve(response);
		};

		params.append("callback", callbackName);

		const script = document.createElement("script");
		script.src = `${endpoint}?${params.toString()}`;
		script.async = true;

		script.onerror = () => {
			if (window[callbackName]) delete window[callbackName];
			if (script.parentNode) document.body.removeChild(script);
			resolve({ success: false, error: "Script injection failed" });
		};

		document.body.appendChild(script);
	});
};

// =====================================================================
// Updated MailerLite-Only Form Handler with Strict Error Reporting
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll("form[data-ml-form]").forEach((form) => {
		form.addEventListener("submit", async (e) => {
			e.preventDefault();

			const formId = form.dataset.mlFormId;
			const groupId = form.dataset.mlGroupId;

			const errorEl = form.querySelector(".form-error");
			const successEl = form.parentElement.querySelector(".form-success");
			const submitBtn = form.querySelector('button[type="submit"]');
			const fd = new FormData(form);

			const data = {
				first_name: (fd.get("first_name") || "").toString().trim(),
				last_name: (fd.get("last_name") || "").toString().trim(),
				email: (fd.get("email") || "").toString().trim(),
				_gotcha: (fd.get("_gotcha") || "").toString().trim(),
			};

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

			if (validationErrors.length > 0) {
				if (errorEl) {
					errorEl.innerHTML = validationErrors.join("<br>");
					errorEl.style.display = "block";
				}
				return;
			}

			// Honeypot check
			if (data._gotcha) {
				form.style.display = "none";
				if (successEl) successEl.style.display = "block";
				return;
			}

			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.dataset.origLabel = submitBtn.textContent.trim();
				submitBtn.textContent = "Sending…";
			}

			try {
				const mailerLiteRes = await window.nyumbaniMlSubscribe({
					formId,
					groupId,
					data,
				});

				console.log("MailerLite Debug Log:", mailerLiteRes);

				// Evaluate strict response conditions
				if (
					mailerLiteRes &&
					(mailerLiteRes.success === true || mailerLiteRes.id)
				) {
					form.style.display = "none";
					if (successEl) successEl.style.display = "block";
					form.reset();
				} else {
					// Extract exact server validation responses if available
					let serverMessage = "Submission rejected by MailerLite.";
					if (mailerLiteRes && mailerLiteRes.errors) {
						serverMessage +=
							" Details: " + JSON.stringify(mailerLiteRes.errors);
					} else if (mailerLiteRes && mailerLiteRes.error) {
						serverMessage += " Error: " + mailerLiteRes.error;
					}
					throw new Error(serverMessage);
				}
			} catch (err) {
				console.error("Submission error details:", err);
				if (errorEl) {
					// Prints the exact technical issue on your page to see what's wrong instantly
					errorEl.innerHTML = `<strong>Submission Error:</strong> ${err.message}<br><br><span style="font-size: 0.85em;">Please check your Account ID, Form ID, or contact info@nyumbanisupportsolutions.com if this persists.</span>`;
					errorEl.style.display = "block";
				}
			} finally {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.textContent =
						submitBtn.dataset.origLabel || "Send Me the Guide";
				}
			}
		});
	});
});
