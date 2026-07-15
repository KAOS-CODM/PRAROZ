document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Footer script loaded");

    const startYear = 2025;
    const currentYear = new Date().getFullYear();
    const copyright =
    startYear === currentYear
        ? currentYear
        : `${startYear} - ${currentYear}`;
        
    const footer = document.getElementById("dynamic-footer");
    if (!footer) {
        console.warn("⚠️ Footer container (#dynamic-footer) not found. Skipping footer setup.");
        return;
    }

    fetch(`${window.API_BASE_URL}/data/contents`, { 
        headers: { "x-api-key": "yemite01" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.footer) {
            const footer = document.getElementById("dynamic-footer");

            if (footer) {
                footer.innerHTML = `
                <footer class="mt-16 bg-slate-900 text-gray-300">
                
                    <div class="max-w-7xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-3">
                
                        <!-- Contact -->
                        <div>
                
                            <h3 class="text-2xl font-bold text-white mb-5">
                                ${data.footer.contact.title}
                            </h3>

                            <address>
                                <div class="space-y-2 text-base">
                                
                                    <p>${data.footer.contact.email}</p>
                                
                                    <p>${data.footer.contact.phone}</p>
                                
                                    <p>${data.footer.contact.address}</p>
                                
                                </div>
                            </address>
            
                
                        </div>
                
                
                        <!-- Quick Links -->
                        <div>
                
                            <h3 class="text-2xl font-bold text-white mb-5">
                                ${data.footer.quickLinks.title}
                            </h3>
                
                            <ul class="space-y-3">
                
                                ${data.footer.quickLinks.links.map(link => `
                                    <li>
                                        <a
                                            href="${link.url}"
                                            class="hover:text-orange-400 transition duration-300"
                                        >
                                            ${link.name}
                                        </a>
                                    </li>
                                `).join("")}
                
                            </ul>
                
                        </div>
                
                
                        <!-- Social -->
                        <div>
                
                            <h3 class="text-2xl font-bold text-white mb-5">
                                ${data.footer.social.title}
                            </h3>
                
                            <div class="flex gap-5 text-3xl">
                
                                ${data.footer.social.links.map(social => `
                                    <a
                                        href="${social.url}"
                                        target="_blank"
                                        class="hover:text-orange-400 transition duration-300 hover:scale-110" aria-label="social-links"
                                    >
                                        <i class="fa-brands fa-${social.platform}"></i>
                                    </a>
                                `).join("")}
                
                            </div>
                
                        </div>
                
                    </div>
                
                    <div class="border-t border-slate-700 py-6">
                
                        <p class="text-center text-sm text-gray-400">
                            &copy; ${copyright} PraRoz. All rights reserved.
                        </p>

                        <p class="text-center text-sm text-gray-400 italic">
                            <span>Built by</span>
                            <a href="#">Treqlo &trade;</a>
                            <p class="text-center text-sm text-gray-400 italic">
                                Building Modern Software for Tomorrow.
                            </p>
                        </p>
                
                    </div>
                
                </footer>
                `;
            }
        }
    })
    .catch(error => console.error("❌ ERROR Fetching Footer:", error));

});