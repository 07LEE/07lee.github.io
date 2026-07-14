// Netflix Automation & Multi-Account Portfolio Logic

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const btnStart = document.getElementById("btn-start");
    const btnReset = document.getElementById("btn-reset");
    const simStatus = document.getElementById("sim-status");
    const telegramChat = document.getElementById("telegram-chat");
    const telegramInput = document.getElementById("telegram-input");
    const telegramSendBtn = document.getElementById("telegram-send-btn");
    const browserUrl = document.getElementById("browser-url");
    const browserViewport = document.getElementById("browser-viewport");
    const terminalLogs = document.getElementById("terminal-logs");
    const selectRoomId = document.getElementById("select-room-id");
    const codeTabs = document.querySelectorAll(".code-tab");
    const codeContents = document.querySelectorAll(".code-content");
    const flowNodes = document.querySelectorAll(".flow-node");
    const archDetails = document.getElementById("arch-details");

    // Simulation State
    let isSimulating = false;
    let currentStep = 0;
    let simMode = "language"; // 'language' or 'verification'
    let selectedRoom = "101";
    let selectedEmail = "user_101@example.com";
    let simTimer = null;
    let smsStep = 0; // Tracks which SMS code we are waiting for

    // Mode Radio Buttons
    const modeRadios = document.querySelectorAll('input[name="sim-mode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if (isSimulating) return;
            simMode = e.target.value;
            resetSimulation();
        });
    });

    // Room Selector
    selectRoomId.addEventListener("change", (e) => {
        if (isSimulating) return;
        selectedRoom = e.target.value;
        selectedEmail = `user_${selectedRoom}@example.com`;
    });

    // Code Highlight Tabs
    codeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            codeTabs.forEach(t => t.classList.remove("active"));
            codeContents.forEach(c => c.classList.remove("active"));
            
            tab.classList.add("active");
            const targetContent = document.getElementById(tab.dataset.tab);
            if (targetContent) targetContent.classList.add("active");
        });
    });

    // Architecture Detail Interactivity
    const archExplanations = {
        "db-flow": "JSON DB Mapping: 객실 번호(예: 101호)를 키값으로 데이터베이스에서 사용자 넷플릭스 크레덴셜(이메일/암호) 및 저장된 성인인증 신원 정보를 즉시 동적 조회하여 라우팅합니다.",
        "tg-flow": "Telegram API: 사용자와 봇 간의 명령 접수 및 진행 상황 브리핑 채널입니다. 백엔드에서 생성된 Playwright 비동기 태스크와 양방향 이벤트를 교환합니다.",
        "queue-flow": "Thread-safe Queue: 봇이 구동되는 메인 루프 스레드와 Playwright 브라우저가 실행되는 독립적 비동기 프로세스 간의 데이터 레이싱 방지를 위한 Queue 메커니즘입니다.",
        "pw-flow": "Playwright Context: 봇 감지 우회를 위한 Stealth 플러그인이 주입된 독립 브라우저 엔진입니다. 계정별 세션 분리를 통해 병렬 작업을 안전하게 지원합니다."
    };

    flowNodes.forEach(node => {
        node.addEventListener("click", () => {
            flowNodes.forEach(n => n.classList.remove("active"));
            node.classList.add("active");
            const key = node.dataset.target;
            if (archExplanations[key]) {
                archDetails.textContent = archExplanations[key];
                archDetails.style.borderStyle = "solid";
                archDetails.style.borderColor = "var(--netflix-red)";
                archDetails.style.background = "rgba(229, 9, 20, 0.05)";
            }
        });
    });

    // Simulator Control Trigger
    btnStart.addEventListener("click", () => {
        if (isSimulating) return;
        startSimulation();
    });

    btnReset.addEventListener("click", () => {
        resetSimulation();
    });

    // Helper functions for Chat & Terminal Markup
    function addChatMessage(sender, text) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}-msg`;
        msgDiv.textContent = text;
        telegramChat.appendChild(msgDiv);
        telegramChat.scrollTop = telegramChat.scrollHeight;
    }

    function addTerminalLog(type, text) {
        const logDiv = document.createElement("div");
        logDiv.className = `log-line text-${type}`;
        logDiv.textContent = text;
        terminalLogs.appendChild(logDiv);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
    }

    function updateBrowser(htmlContent) {
        browserViewport.innerHTML = htmlContent;
    }

    // SIMULATION FLOWS
    function startSimulation() {
        isSimulating = true;
        btnStart.disabled = true;
        btnReset.disabled = false;
        modeRadios.forEach(r => r.disabled = true);
        selectRoomId.disabled = true;
        simStatus.textContent = "진행 중";
        simStatus.classList.add("active");

        telegramChat.innerHTML = "";
        terminalLogs.innerHTML = "";
        currentStep = 0;
        smsStep = 0;

        addTerminalLog("muted", "[SYSTEM] Launching async Playwright chromium browser in headless mode...");
        
        if (simMode === "language") {
            runLanguageSimulation();
        } else {
            runVerificationSimulation();
        }
    }

    function resetSimulation() {
        isSimulating = false;
        if (simTimer) clearTimeout(simTimer);
        btnStart.disabled = false;
        btnReset.disabled = true;
        modeRadios.forEach(r => r.disabled = false);
        selectRoomId.disabled = false;
        simStatus.textContent = "대기 중";
        simStatus.classList.remove("active");
        
        telegramInput.value = "";
        telegramInput.readOnly = true;
        telegramSendBtn.disabled = true;

        telegramChat.innerHTML = `
            <div class="message system-msg">
                자동화 모드와 대상을 지정한 후 [자동화 시작] 버튼을 클릭해 주세요.
            </div>
        `;

        browserUrl.textContent = "https://www.netflix.com";
        browserViewport.innerHTML = `
            <div class="netflix-blank-screen">
                <div class="netflix-logo">NETFLIX</div>
                <p class="netflix-status-text">대기 중</p>
            </div>
        `;

        terminalLogs.innerHTML = `
            <div class="log-line text-muted">[SYSTEM] Simulation ready. Select mode and start.</div>
        `;
    }

    // 1. LANGUAGE CHANGE SCENARIO
    function runLanguageSimulation() {
        const steps = [
            // Step 0: User Command in Telegram
            () => {
                addChatMessage("user", `/netflix_change`);
                addTerminalLog("muted", "[BACKEND] Received /netflix_change command. Querying room database...");
                simTimer = setTimeout(nextStep, 1000);
            },
            // Step 1: Bot offers rooms
            () => {
                addChatMessage("bot", "언어 설정을 변경할 객실 번호를 선택해 주세요.");
                addTerminalLog("muted", "[BACKEND] Awaiting room selection query query_data callback...");
                simTimer = setTimeout(() => {
                    addChatMessage("user", `[객실 선택] ${selectedRoom}호`);
                    addTerminalLog("muted", `[BACKEND] Selected Room: ${selectedRoom}. Fetching credentials for ${selectedEmail}...`);
                    nextStep();
                }, 1500);
            },
            // Step 2: Bot offers languages
            () => {
                addChatMessage("bot", `${selectedRoom}호 계정의 변경할 타겟 프로필 언어를 선택해 주세요.`);
                simTimer = setTimeout(() => {
                    addChatMessage("user", "[언어 선택] English");
                    addTerminalLog("muted", "[BACKEND] Selected Language: English (code: en). Initializing automation worker...");
                    nextStep();
                }, 1500);
            },
            // Step 3: Worker begins
            () => {
                addChatMessage("bot", `[알림] ${selectedRoom}호의 넷플릭스 언어를 English로 전환 중입니다. 잠시만 기다려 주세요.`);
                browserUrl.textContent = "https://www.netflix.com/kr/login";
                updateBrowser(`
                    <div class="netflix-login-frame">
                        <div class="netflix-card">
                            <h3 style="color:white;">Sign In</h3>
                            <input type="text" id="mock-login-id" class="netflix-input" value="" placeholder="Email or phone number" readonly>
                            <input type="password" id="mock-login-pw" class="netflix-input" value="" placeholder="Password" readonly>
                            <button class="netflix-btn">Sign In</button>
                        </div>
                    </div>
                `);
                addTerminalLog("info", "[PLAYWRIGHT] Applied stealth scripts successfully.");
                addTerminalLog("info", "Navigate URL: https://www.netflix.com/kr/login");
                simTimer = setTimeout(nextStep, 1000);
            },
            // Step 4: Typing login credentials
            () => {
                addTerminalLog("info", `[PLAYWRIGHT] Typing login ID: ${selectedEmail}`);
                const loginInput = document.getElementById("mock-login-id");
                if (loginInput) loginInput.value = selectedEmail;
                
                simTimer = setTimeout(() => {
                    addTerminalLog("info", "[PLAYWRIGHT] Typing password: ••••••••");
                    const pwInput = document.getElementById("mock-login-pw");
                    if (pwInput) pwInput.value = "********";
                    
                    simTimer = setTimeout(() => {
                        addTerminalLog("info", "[PLAYWRIGHT] Clicking submit button...");
                        nextStep();
                    }, 1000);
                }, 1000);
            },
            // Step 5: Select profile
            () => {
                browserUrl.textContent = "https://www.netflix.com/ManageProfiles";
                addTerminalLog("info", "Navigate URL: https://www.netflix.com/ManageProfiles");
                addTerminalLog("info", "[PLAYWRIGHT] Querying list of profiles...");
                
                updateBrowser(`
                    <div class="netflix-profiles-frame">
                        <h3 style="color:white;">Manage Profiles</h3>
                        <div class="profiles-list">
                            <div class="profile-item">
                                <div class="profile-avatar"></div>
                                <span class="profile-name">기본프로필 1</span>
                            </div>
                            <div class="profile-item">
                                <div class="profile-avatar"></div>
                                <span class="profile-name">기본프로필 2</span>
                            </div>
                            <div class="profile-item" id="target-profile">
                                <div class="profile-avatar avatar-target"></div>
                                <span class="profile-name" style="color:var(--netflix-red);">변경 프로필 (마지막)</span>
                            </div>
                        </div>
                    </div>
                `);

                simTimer = setTimeout(() => {
                    const targetProfile = document.getElementById("target-profile");
                    if (targetProfile) targetProfile.classList.add("clicked");
                    addTerminalLog("info", "[PLAYWRIGHT] Auto-selected the last profile in the row.");
                    simTimer = setTimeout(nextStep, 1500);
                }, 1000);
            },
            // Step 6: Select language dropdown
            () => {
                addTerminalLog("info", "[PLAYWRIGHT] Clicking profile language selector...");
                updateBrowser(`
                    <div class="netflix-lang-frame">
                        <h3 style="color:white;">Edit Profile Language</h3>
                        <div class="lang-select-group">
                            <div class="lang-option" id="lang-ko">한국어 (Korean)</div>
                            <div class="lang-option selected" id="lang-en">English (영어)</div>
                        </div>
                        <button class="netflix-btn" id="btn-save-lang" style="max-width:180px; margin: 0 auto; display:block;">Save</button>
                    </div>
                `);

                simTimer = setTimeout(() => {
                    addTerminalLog("info", "[PLAYWRIGHT] Select language code: 'en'");
                    const saveBtn = document.getElementById("btn-save-lang");
                    if (saveBtn) saveBtn.style.transform = "scale(0.95)";
                    addTerminalLog("info", "[PLAYWRIGHT] Language changed to 'en'. Saving configurations...");
                    simTimer = setTimeout(nextStep, 1500);
                }, 1000);
            },
            // Step 7: Completed
            () => {
                addTerminalLog("info", "[PLAYWRIGHT] Save request returned HTTP 200. Closing context...");
                browserUrl.textContent = "https://www.netflix.com/browse";
                updateBrowser(`
                    <div class="netflix-blank-screen">
                        <div class="netflix-logo" style="color:#27c93f;">COMPLETED</div>
                        <p class="netflix-status-text">언어 설정 변경 자동화 완료</p>
                    </div>
                `);
                addChatMessage("bot", `[완료] ${selectedRoom}호: 언어 설정을 'English'로 변경 완료했습니다.`);
                
                simStatus.textContent = "완료";
                simStatus.classList.remove("active");
                btnStart.disabled = false;
                modeRadios.forEach(r => r.disabled = false);
                selectRoomId.disabled = false;
                isSimulating = false;
            }
        ];

        function nextStep() {
            if (!isSimulating) return;
            if (currentStep < steps.length) {
                steps[currentStep]();
                currentStep++;
            }
        }
        nextStep();
    }

    // 2. ADULT VERIFICATION SCENARIO (With Active Queue interaction)
    function runVerificationSimulation() {
        const steps = [
            // Step 0: User Command in Telegram
            () => {
                addChatMessage("user", `/netflix_verify`);
                addTerminalLog("muted", "[BACKEND] Received /netflix_verify command. Requesting room allocation...");
                simTimer = setTimeout(nextStep, 1000);
            },
            // Step 1: Choose Room
            () => {
                addChatMessage("bot", "성인인증을 진행할 객실 번호를 선택해 주세요.");
                simTimer = setTimeout(() => {
                    addChatMessage("user", `[객실 선택] ${selectedRoom}호`);
                    addTerminalLog("muted", `[BACKEND] Assigned session for room ${selectedRoom}. Initializing verification pipeline...`);
                    addChatMessage("bot", `[알림] ${selectedRoom}호 넷플릭스 인증을 시작합니다. 잠시만 기다려 주세요.`);
                    nextStep();
                }, 1500);
            },
            // Step 2: Open Browser & Ask Name
            () => {
                browserUrl.textContent = "https://www.netflix.com/kr/login";
                updateBrowser(`
                    <div class="netflix-login-frame">
                        <div class="netflix-card">
                            <h3 style="color:white;">Sign In</h3>
                            <input type="text" class="netflix-input" value="${selectedEmail}" readonly>
                            <input type="password" class="netflix-input" value="********" readonly>
                            <button class="netflix-btn">Sign In</button>
                        </div>
                    </div>
                `);
                addTerminalLog("info", "[PLAYWRIGHT] Applied anti-fingerprinting stealth layer.");
                addTerminalLog("info", "Logged into netflix with account linked to room " + selectedRoom);
                
                simTimer = setTimeout(() => {
                    addChatMessage("bot", "성인인증을 진행할 이름(실명)을 입력해 주세요.");
                    simTimer = setTimeout(() => {
                        addChatMessage("user", "홍길동");
                        nextStep();
                    }, 1500);
                }, 1500);
            },
            // Step 3: Ask Gender
            () => {
                addChatMessage("bot", "성별을 선택해 주세요.");
                simTimer = setTimeout(() => {
                    addChatMessage("user", "남성");
                    nextStep();
                }, 1500);
            },
            // Step 4: Ask Birthdate
            () => {
                addChatMessage("bot", "생년월일 8자리를 숫자로만 입력해 주세요. (예: 19900101)");
                simTimer = setTimeout(() => {
                    addChatMessage("user", "19900101");
                    nextStep();
                }, 1500);
            },
            // Step 5: Ask Carrier
            () => {
                addChatMessage("bot", "휴대폰 통신사를 선택해 주세요.");
                simTimer = setTimeout(() => {
                    addChatMessage("user", "SKT");
                    nextStep();
                }, 1500);
            },
            // Step 6: Ask Phone
            () => {
                addChatMessage("bot", "휴대폰 번호를 숫자로만 입력해 주세요.");
                simTimer = setTimeout(() => {
                    addChatMessage("user", "01012345678");
                    nextStep();
                }, 1500);
            },
            // Step 7: Submit Info to Queue & Start Browser Input Animation
            () => {
                addChatMessage("bot", "정보를 입력 중입니다. 넷플릭스에서 인증번호를 보낼 때까지 잠시만 기다려 주세요...");
                addTerminalLog("muted", "[BACKEND] Enqueueing gathered identity packet to info_q...");
                addTerminalLog("info", "[PLAYWRIGHT] Picked up data from info_q. Navigating to verifyage...");
                
                browserUrl.textContent = "https://www.netflix.com/verifyage";
                updateBrowser(`
                    <div class="netflix-verify-frame">
                        <div class="netflix-card" style="max-width:350px;">
                            <h3 style="color:white; font-size:1.15rem; margin-bottom:12px;">성인인증 (Identity Verify)</h3>
                            <input type="text" id="m-name" class="netflix-input" placeholder="이름" style="margin-bottom:8px;" readonly>
                            <input type="text" id="m-birth" class="netflix-input" placeholder="생년월일 8자리" style="margin-bottom:8px;" readonly>
                            <input type="text" id="m-carrier" class="netflix-input" placeholder="통신사" style="margin-bottom:8px;" readonly>
                            <input type="text" id="m-phone" class="netflix-input" placeholder="휴대폰 번호" style="margin-bottom:8px;" readonly>
                            <button class="netflix-btn">인증 코드 전송</button>
                        </div>
                    </div>
                `);

                simTimer = setTimeout(() => {
                    addTerminalLog("info", "[PLAYWRIGHT] Typing Name: 홍길동");
                    document.getElementById("m-name").value = "홍길동";
                    
                    simTimer = setTimeout(() => {
                        addTerminalLog("info", "[PLAYWRIGHT] Typing Birthdate: 19900101");
                        document.getElementById("m-birth").value = "19900101";
                        
                        simTimer = setTimeout(() => {
                            addTerminalLog("info", "[PLAYWRIGHT] Setting Carrier: SKT");
                            document.getElementById("m-carrier").value = "SKT";
                            
                            simTimer = setTimeout(() => {
                                addTerminalLog("info", "[PLAYWRIGHT] Typing Phone number: 01012345678");
                                document.getElementById("m-phone").value = "01012345678";
                                
                                simTimer = setTimeout(() => {
                                    addTerminalLog("info", "[PLAYWRIGHT] Submitting identity verification form...");
                                    nextStep();
                                }, 1000);
                            }, 800);
                        }, 800);
                    }, 800);
                }, 1200);
            },
            // Step 8: Send SMS #1 Request
            () => {
                addTerminalLog("warn", "[PLAYWRIGHT] Form submitted. Netflix sent SMS verification code.");
                addTerminalLog("muted", "[BACKEND] Triggering thread block. Waiting for user input on code_q (180s)...");
                
                addChatMessage("bot", "인증 코드가 전송되었습니다. 전송받은 6자리 인증번호를 텔레그램 채팅창에 입력해 주세요.");
                
                // Enable manual input mockup
                telegramInput.readOnly = false;
                telegramInput.placeholder = "6자리 인증번호 입력 후 전송...";
                telegramSendBtn.disabled = false;
                smsStep = 1;
            }
        ];

        function nextStep() {
            if (!isSimulating) return;
            if (currentStep < steps.length) {
                steps[currentStep]();
                currentStep++;
            }
        }
        nextStep();
    }

    // Handles simulation input from Telegram mockup
    telegramSendBtn.addEventListener("click", () => {
        const codeVal = telegramInput.value.trim();
        if (!codeVal || codeVal.length !== 6 || isNaN(codeVal)) {
            alert("올바른 6자리 숫자를 입력해 주세요.");
            return;
        }

        addChatMessage("user", codeVal);
        telegramInput.value = "";
        telegramInput.readOnly = true;
        telegramSendBtn.disabled = true;

        if (smsStep === 1) {
            addTerminalLog("muted", `[BACKEND] Enqueued SMS code ${codeVal} into code_q. Resuming Playwright thread...`);
            addTerminalLog("info", `[PLAYWRIGHT] Filling SMS OTP input with: ${codeVal}`);
            
            // Simulating filling input in browser
            updateBrowser(`
                <div class="netflix-verify-frame">
                    <div class="netflix-card">
                        <h3 style="color:white;">OTP Verification</h3>
                        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">코드가 정상 입력되었습니다.</p>
                        <input type="text" class="netflix-input" value="${codeVal}" readonly>
                        <button class="netflix-btn" style="background-color:#27c93f;">Verifying...</button>
                    </div>
                </div>
            `);

            setTimeout(() => {
                addTerminalLog("info", "[PLAYWRIGHT] Verification completed. Redirect URL check OK.");
                addTerminalLog("warn", "[SECURITY] Initiating privacy protection flow: Removing phone number from account security...");
                browserUrl.textContent = "https://www.netflix.com/account/security";
                
                updateBrowser(`
                    <div class="netflix-sec-frame">
                        <div class="netflix-card" style="max-width:380px;">
                            <h3 style="color:white;">Account Security</h3>
                            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">휴대폰 번호 삭제 보안 단계</p>
                            <input type="text" class="netflix-input" value="010-****-5678" readonly>
                            <button class="netflix-btn">휴대폰 번호 삭제</button>
                        </div>
                    </div>
                `);

                setTimeout(() => {
                    addTerminalLog("info", "[PLAYWRIGHT] Triggering removal SMS configuration...");
                    addTerminalLog("muted", "[BACKEND] Triggering thread block. Waiting for removal OTP on code_q (180s)...");
                    
                    addChatMessage("bot", "보안 유지를 위해 계정에 임시 등록된 번호를 삭제합니다. 전송된 두 번째 삭제 인증코드를 입력해 주세요.");
                    
                    telegramInput.readOnly = false;
                    telegramInput.placeholder = "두 번째 인증번호 입력...";
                    telegramSendBtn.disabled = false;
                    smsStep = 2;
                }, 1500);

            }, 2000);
        } else if (smsStep === 2) {
            addTerminalLog("muted", `[BACKEND] Enqueued deletion SMS code ${codeVal} into code_q. Resuming thread...`);
            addTerminalLog("info", `[PLAYWRIGHT] Verifying removal code: ${codeVal}`);
            
            updateBrowser(`
                <div class="netflix-sec-frame">
                    <div class="netflix-card">
                        <h3 style="color:white;">Deleting Phone Number...</h3>
                        <div style="text-align:center; padding: 20px 0;">
                            <div class="sim-badge active" style="margin: 0 auto; display:inline-block;">Processing</div>
                        </div>
                    </div>
                </div>
            `);

            setTimeout(() => {
                addTerminalLog("warn", "[PLAYWRIGHT] Phone number successfully removed from account info.");
                addTerminalLog("info", "[PLAYWRIGHT] Automation script cleanup. Browser closing...");
                
                browserUrl.textContent = "https://www.netflix.com";
                updateBrowser(`
                    <div class="netflix-blank-screen">
                        <div class="netflix-logo" style="color:#27c93f;">SECURE & DONE</div>
                        <p class="netflix-status-text">성인인증 완료 및 개인정보 파기 성공</p>
                    </div>
                `);

                addChatMessage("bot", "성인인증이 최종 승인되었으며, 계정에 임시 등록된 휴대폰 번호도 완전히 삭제되어 보안 조치되었습니다.");

                simStatus.textContent = "완료";
                simStatus.classList.remove("active");
                btnStart.disabled = false;
                modeRadios.forEach(r => r.disabled = false);
                selectRoomId.disabled = false;
                isSimulating = false;
                smsStep = 0;
            }, 2500);
        }
    });

    // Support submitting by pressing Enter key inside mock input
    telegramInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !telegramSendBtn.disabled) {
            telegramSendBtn.click();
        }
    });
});
