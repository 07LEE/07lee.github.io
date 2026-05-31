// Premium Presentation & Pension Estimate Calendar Engine Script (script.js)

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------
    // 1. Slide Control Logic
    // ---------------------------------------------
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    const updateSlides = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === totalSlides - 1;
        currentSlide = index;
    };

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            updateSlides(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            updateSlides(currentSlide - 1);
        }
    };

    // Navigation button events
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Indicator click events
    indicators.forEach((indicator, idx) => {
        indicator.addEventListener('click', () => {
            updateSlides(idx);
        });
    });

    // Keyboard navigation events
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') {
            return;
        }
        
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        }
    });

    // ---------------------------------------------
    // 2. Slide 3: Feature Preview Control
    // ---------------------------------------------
    const featureItems = document.querySelectorAll('.feature-item');
    const previewInners = document.querySelectorAll('.preview-inner');

    featureItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            featureItems.forEach(fi => fi.classList.remove('active'));
            item.classList.add('active');
            
            const targetId = item.getAttribute('data-target');
            previewInners.forEach(pi => {
                if (pi.id === targetId) {
                    pi.classList.remove('hidden');
                } else {
                    pi.classList.add('hidden');
                }
            });
        });
    });

    // ---------------------------------------------
    // 3. Slide 4: Real-time Pension Estimate Engine (Physical ID Mapping)
    // ---------------------------------------------
    const naturalInput = document.getElementById('natural-input');
    const estItemsBody = document.getElementById('est-items-body');
    
    // Map physical template markup spans
    const estGuestName = document.getElementById('guest_name');
    const estInvoiceDate = document.getElementById('invoice_date');
    const estCheckInSpan = document.getElementById('check_in_date');
    const estCheckOutSpan = document.getElementById('check_out_date');
    const estTotalPrice = document.getElementById('totalPrice');
    const estTax = document.getElementById('tax');
    
    const estBankName = document.getElementById('bank_name');
    const estBankAccount = document.getElementById('bank_account_number');
    const estBankHolder = document.getElementById('bank_holder');
    
    // Map comprehensive summary fields
    const estSummaryTotal = document.getElementById('summary-total');
    const estSummaryCleaning = document.getElementById('summary-cleaning-fee');
    const estSummaryVat = document.getElementById('summary-vat');
    const estSummaryGrand = document.getElementById('summary-grand-total');

    const vatModeSelect = document.getElementById('vat-mode-select');
    const cleaningFeeToggle = document.getElementById('cleaning-fee-toggle');
    const itemsTable = document.getElementById('items-table');

    // Set the current date
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    estInvoiceDate.textContent = formattedDate;

    // Helper function to convert Korean text numbers (e.g. '만' for 10,000) into actual numbers
    const parseKoreanNumber = (str) => {
        if (!str) return 0;
        let cleanStr = str.replace(/,/g, '').trim();
        
        let multiplier = 1;
        if (cleanStr.includes('만')) {
            multiplier = 10000;
            cleanStr = cleanStr.replace('만', '');
        }
        
        const num = parseFloat(cleanStr);
        return isNaN(num) ? 0 : num * multiplier;
    };

    // Core logic for natural language pension info parsing & reservation calculations
    const parsePensionRequest = () => {
        const text = naturalInput.value;
        
        // 1. Try parsing the guest name
        let guestName = "고객";
        const guestMatch = text.match(/(?:예약자|성함|성명|고객명)?\s*([가-힣]{2,4})\b/);
        if (guestMatch) {
            const matchedName = guestMatch[1];
            if (matchedName !== "주중" && matchedName !== "주말" && matchedName !== "별도" && matchedName !== "포함") {
                guestName = matchedName;
            }
        }
        estGuestName.textContent = guestName;

        // 2. Try parsing the room name
        let roomName = "Room 101";
        const roomMatch = text.match(/(\d{3}\s*호|\b[a-zA-Z\d\s\-]+룸\b|\b독채\b|\b[a-zA-Z\d]+\s*객실\b)/i);
        if (roomMatch) {
            roomName = roomMatch[1].trim();
        }

        // 3. Try parsing dates (Calendar calculation)
        let checkInDate = "";
        let checkOutDate = "";
        let nights = 0;
        
        const currentYear = today.getFullYear();
        const dateMatch = text.match(/(\d+)\s*[월/\-]\s*(\d+)\s*[일]?\s*(?:에서|~|부터|to|-)\s*(?:(\d+)\s*[월/\-])?\s*(\d+)\s*[일]?/i);
        
        if (dateMatch) {
            const startMonth = parseInt(dateMatch[1], 10);
            const startDay = parseInt(dateMatch[2], 10);
            let endMonth = startMonth;
            
            if (dateMatch[3] !== undefined) {
                endMonth = parseInt(dateMatch[3], 10);
            }
            const endDay = parseInt(dateMatch[4], 10);

            const cin = new Date(currentYear, startMonth - 1, startDay);
            const cout = new Date(currentYear, endMonth - 1, endDay);

            if (!isNaN(cin.getTime()) && !isNaN(cout.getTime()) && cin < cout) {
                checkInDate = `${cin.getFullYear()}-${String(cin.getMonth() + 1).padStart(2, '0')}-${String(cin.getDate()).padStart(2, '0')}`;
                checkOutDate = `${cout.getFullYear()}-${String(cout.getMonth() + 1).padStart(2, '0')}-${String(cout.getDate()).padStart(2, '0')}`;
                
                const diffTime = Math.abs(cout - cin);
                nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
        }

        if (!checkInDate || !checkOutDate) {
            const tempCin = new Date(currentYear, today.getMonth(), today.getDate() + 1);
            const tempCout = new Date(currentYear, today.getMonth(), today.getDate() + 3);
            checkInDate = `${tempCin.getFullYear()}-${String(tempCin.getMonth() + 1).padStart(2, '0')}-${String(tempCin.getDate()).padStart(2, '0')}`;
            checkOutDate = `${tempCout.getFullYear()}-${String(tempCout.getMonth() + 1).padStart(2, '0')}-${String(tempCout.getDate()).padStart(2, '0')}`;
            nights = 2;
        }

        estCheckInSpan.textContent = checkInDate;
        estCheckOutSpan.textContent = checkOutDate;

        // 4. Detect weekday/weekend prices (Enforce keywords to prevent false parsing)
        let weekdayPrice = 100000;
        let weekendPrice = 150000;

        const weekdayMatch = text.match(/(?:주중|평일|일~목)\s*(?:각\s*)?([\d,]+(?:만)?)\s*(?:원|₩)?/i);
        if (weekdayMatch) {
            weekdayPrice = parseKoreanNumber(weekdayMatch[1]);
        }

        const weekendMatch = text.match(/(?:주말|금토|금요|토요)\s*(?:각\s*)?([\d,]+(?:만)?)\s*(?:원|₩)?/i);
        if (weekendMatch) {
            weekendPrice = parseKoreanNumber(weekendMatch[1]);
        }

        // 5. Detect cleaning fee
        let cleaningFee = 0;
        const cleaningMatch = text.match(/(?:청소비|관리비)\s*([\d,]+(?:만)?)\s*(?:원|₩)?/i);
        if (cleaningMatch) {
            cleaningFee = parseKoreanNumber(cleaningMatch[1]);
            cleaningFeeToggle.checked = true;
        } else if (text.includes("청소비 없음") || text.includes("청소비 제외")) {
            cleaningFeeToggle.checked = false;
        }

        // 6. Detect VAT text integration
        if (text.includes("부가세 별도") || text.includes("vat 별도") || text.includes("VAT 별도")) {
            vatModeSelect.value = "excl";
        } else if (text.includes("부가세 포함") || text.includes("vat 포함") || text.includes("VAT 포함")) {
            vatModeSelect.value = "incl";
        } else if (text.includes("부가세 없음") || text.includes("부가세 면제")) {
            vatModeSelect.value = "none";
        }

        // ---------------------------------------------
        // Weighted daily rate calculation engine (Calendar loop traversal)
        // ---------------------------------------------
        let totalAccom = 0;
        const cinObj = new Date(checkInDate);
        const coutObj = new Date(checkOutDate);
        
        let tempDate = new Date(cinObj);
        while (tempDate < coutObj) {
            const dayOfWeek = tempDate.getDay();
            if (dayOfWeek === 5 || dayOfWeek === 6) {
                totalAccom += weekendPrice;
            } else {
                totalAccom += weekdayPrice;
            }
            tempDate.setDate(tempDate.getDate() + 1);
        }

        const isCleaningEnabled = cleaningFeeToggle.checked;
        const finalClean = isCleaningEnabled ? cleaningFee : 0;
        if (isCleaningEnabled) {
            itemsTable.classList.add('cleaning-fee-visible');
            document.getElementById('cleaning-fee-row').style.display = '';
        } else {
            itemsTable.classList.remove('cleaning-fee-visible');
            document.getElementById('cleaning-fee-row').style.display = 'none';
        }

        // ---------------------------------------------
        // Compute final amounts and bank details based on tax (VAT) mode
        // ---------------------------------------------
        const vatMode = vatModeSelect.value;
        let supplyValue = totalAccom;
        let vat = 0;
        let grandTotal = 0;

        if (vatMode === "excl") {
            vat = Math.floor(totalAccom * 0.1);
            grandTotal = totalAccom + finalClean + vat;
            
            estBankName.textContent = "더미은행 (법인)";
            estBankAccount.textContent = "110-987-654321";
            estBankHolder.textContent = "스마트스테이(부가세정산)";
            document.getElementById('vat-row').style.display = '';
        } else if (vatMode === "incl") {
            supplyValue = Math.round(totalAccom / 1.1);
            vat = totalAccom - supplyValue;
            grandTotal = totalAccom + finalClean;
            
            estBankName.textContent = "더미은행 (법인)";
            estBankAccount.textContent = "110-987-654321";
            estBankHolder.textContent = "스마트스테이(부가세정산)";
            document.getElementById('vat-row').style.display = '';
        } else {
            grandTotal = totalAccom + finalClean;
            
            estBankName.textContent = "더미은행 (일반)";
            estBankAccount.textContent = "110-123-456789";
            estBankHolder.textContent = "스마트스테이";
            document.getElementById('vat-row').style.display = 'none';
        }

        // Render table rows
        estItemsBody.innerHTML = '';
        const tr = document.createElement('tr');
        
        const dispAccom = (vatMode === "incl") ? supplyValue : totalAccom;
        const avgUnitPrice = nights > 0 ? Math.round(dispAccom / nights) : 0;

        tr.innerHTML = `
            <td>1</td>
            <td class="col-room">${roomName}</td>
            <td>${nights}</td>
            <td>${checkInDate}</td>
            <td>${checkOutDate}</td>
            <td class="txt-right">${avgUnitPrice.toLocaleString()}</td>
            <td class="col-cleaning txt-right">${finalClean.toLocaleString()}</td>
            <td class="txt-right">${(dispAccom + finalClean).toLocaleString()}</td>
        `;
        estItemsBody.appendChild(tr);

        // Update grand total and tax summary display
        estSummaryTotal.textContent = supplyValue.toLocaleString();
        estSummaryCleaning.textContent = finalClean.toLocaleString();
        estSummaryVat.textContent = vat.toLocaleString();
        estSummaryGrand.textContent = grandTotal.toLocaleString();

        // Sync top info table summaries (Total Price, Tax)
        estTotalPrice.textContent = "₩" + (supplyValue + finalClean).toLocaleString();
        estTax.textContent = "₩" + vat.toLocaleString();
    };

    naturalInput.addEventListener('input', parsePensionRequest);
    vatModeSelect.addEventListener('change', parsePensionRequest);
    cleaningFeeToggle.addEventListener('change', parsePensionRequest);

    parsePensionRequest();

    // ---------------------------------------------
    // 5. PDF Download Demo Feedback
    // ---------------------------------------------
    const pdfBtn = document.getElementById('btn-pdf');
    pdfBtn.addEventListener('click', () => {
        const originalText = pdfBtn.innerHTML;
        pdfBtn.disabled = true;
        pdfBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 문서화 포맷 렌더링 중...';
        
        setTimeout(() => {
            pdfBtn.innerHTML = '<i class="fa-solid fa-check"></i> 렌더링 완료! 인쇄 창 열기';
            
            setTimeout(() => {
                window.print();
                pdfBtn.innerHTML = originalText;
                pdfBtn.disabled = false;
            }, 800);
        }, 1200);
    });
});
