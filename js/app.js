// ==========================================
// API 설정
// ==========================================
// 도메인에 따라 API URL 자동 전환
const API_URL = (function() {
    const hostname = window.location.hostname;
    
    // www.mesgrip.com으로 접근하면 실제 API 서버 사용
    if (hostname === 'www.mesgrip.com' || hostname === 'mesgrip.com') {
        return 'https://api.mesgrip.com/public/ws';
    }
    
    // 그 외의 경우 (localhost, 127.0.0.1, 테스트 도메인 등) 테스트 서버 사용
    return 'http://127.0.0.1:8024/public/ws';
})();

//console.log('🔗 API URL:', API_URL);

// ==========================================
// 전역 변수
// ==========================================
let verificationTimer = null;
let timeLeft = 300; // 5분 (300초)
let jtSeq = null; // 인증관리번호
let isVerified = false; // 이메일 인증 완료 여부
let currentLanguage = localStorage.getItem('mesgrip-lang') || 'ko';

const I18N = {
    ko: {
        htmlLang: 'ko',
        metaDescription: 'MESGRIP - 인쇄공정 통합관리 솔루션',
        title: 'MESGRIP - 스마트한 인쇄 생산관리',
        nav: ['홈', '솔루션', '서비스상품', '기대효과', '데모 체험'],
        heroBadge: '인쇄 산업의 디지털 혁신',
        heroTitle: '스마트한 인쇄 생산관리<br><span class="highlight">MESGRIP</span>으로 시작하세요',
        heroDescription: '수주부터 생산, 정산까지 하나로 연결되는<br>인쇄공정 통합관리 솔루션',
        heroButtons: ['데모체험 시작하기', '자세히 알아보기'],
        sectionTitles: ['통합 관리의 모든 것', '서비스 상품', 'MESGRIP 도입 기대효과', '궁굼한 점이 있으신가요? 지금 바로 문의하세요'],
        sectionDescriptions: [
            '인쇄 사업의 모든 프로세스를 하나의 시스템으로 관리하세요',
            '비즈니스 규모에 맞는 최적의 상품을 선택하세요',
            '검증된 효과로 비즈니스 성장을 가속화하세요',
            '빠른시간안에 답변드립니다.'
        ],
        solutionTitles: ['수주관리', '생산관리', '외주관리', '팩키지관리', '물류관리', '자재관리', '정산관리', '통계관리'],
        solutionDescriptions: [
            '작업 등록부터 견적서 발행, 수주 확정까지 거래처별 수주 현황을 실시간으로 관리하고 변경사항을 즉시 공지할 수 있습니다.',
            '공정별 작업 진행상황을 한눈에 파악하고 작업지시서를 자동 생성하여 효율적인 생산 프로세스를 구축하세요.',
            '협력업체와 실시간으로 소통하며 외주 발주부터 품질 검수까지 스마트하게 협업 관리할 수 있습니다.',
            '다품목 개별생산을 단일건으로 묶어 팩키지별 원가 계산과 일정을 통합 관리할 수 있습니다.',
            '입출고 등록부터 배송 스케줄, 차량 배차까지 실시간으로 배송 현황을 추적할 수 있습니다.',
            '자재 입출고부터 재고 현황까지 실시간으로 조회하고 안전재고 알림으로 효율적으로 관리하세요.',
            '매출/매입 자료를 등록하고 거래처별 정산을 관리하며 전자세금계산서를 연동하여 스마트하게 정산하세요.',
            '매출과 생산 통계를 분석하고 거래처별 실적을 조회하며 맞춤형 대시보드로 한눈에 파악하세요.'
        ],
        solutionFeatures: [
            '작업 등록 및 수정 관리', '견적서 자동 발행', '수주 진행상태 트래킹', '거래처별 현황 조회', '변경사항 실시간 공지',
            '공정별 진행상황 관리', '작업지시서 자동 생성', '실시간 생산현황 모니터링', '설비 가동률 분석', '불량률 추적 및 관리',
            '외주업체 등록 및 평가', '외주 발주 및 진행관리', '외주비용 자동 정산', '협력업체 실시간 소통', '품질 검수 시스템',
            '다품목 일괄 등록 관리', '세트 상품 구성 관리', '팩키지별 원가 계산', '일정 통합 관리', '출고 순서 자동 최적화',
            '입고/출고 등록 및 추적', '배송 스케줄 관리', '차량 배차 최적화', '실시간 배송 현황 조회', '배송 완료 알림',
            '자재 입출고 관리', '재고 현황 실시간 조회', '안전재고 알림 기능', '발주 자동 추천', '자재별 소요량 분석',
            '매출/매입 자료 등록', '거래처별 정산 관리', '전자세금계산서 연동', '수금/지급 스케줄 관리', '손익 분석 및 리포트',
            '매출/생산 통계 분석', '거래처별 실적 조회', '기간별 비교 분석', '품목별 수익성 분석', '맞춤형 대시보드 제공'
        ],
        productBadges: ['소기업', '일반사업장', '중소규모'],
        productDescriptions: ['소규모 인쇄업체', '일반규모 인쇄업체', '중소규모 인쇄업체'],
        productPrices: ['월 30만원', '월 50만원', '월 80만원'],
        productFeatures: [
            '기본설정', '현장관리', '정산관리', '게시판', '사용자 5명',
            '기본설정', '현장관리', '정산관리(거래처수금현황)', '메세지(FAX,SMS,Email)', '게시판', '사용자 10명',
            '기본설정', '현장관리(팩키지)', '정산관리(거래처수금현황)', '메세지(FAX,SMS,Email)', '자재관리', '통계관리', '게시판', '사용자 20명'
        ],
        productNotice: '※ 추가 계정당 20,000원 별도 비용',
        productButtons: ['시작하기', '시작하기', '시작하기'],
        benefitTitles: ['업무 효율 30% 향상', '비용 절감 20%', '품질 향상', '납기 준수율 95%', '데이터 기반 의사결정', '협업 강화'],
        benefitDescriptions: [
            '자동화된 프로세스와 실시간 정보 공유로<br>반복 업무를 줄이고 생산성을 높입니다.',
            '재고 최적화와 불량률 감소로<br>운영 비용을 효과적으로 절감합니다.',
            '체계적인 공정 관리와 품질 검수로<br>불량률을 최소화하고 품질을 높입니다.',
            '실시간 진행 관리와 일정 최적화로<br>고객 만족도를 크게 향상시킵니다.',
            '통합 대시보드와 상세 분석으로<br>정확한 경영 판단을 지원합니다.',
            '부서 간 실시간 정보 공유로<br>원활한 커뮤니케이션을 실현합니다.'
        ],
        imageAlts: {
            processDiagrams: ['수주 프로세스', '생산 프로세스', '외주 프로세스', '팩키지 프로세스', '물류 프로세스', '자재 프로세스', '정산 프로세스', '통계 프로세스'],
            screenshots: ['수주관리 화면', '생산관리 화면', '외주관리 화면', '팩키지관리 화면', '물류관리 화면', '자재관리 화면 1', '자재관리 화면 2', '정산관리 화면 1', '정산관리 화면 2', '통계관리 화면 1', '통계관리 화면 2']
        },
        footerContact: ['서울 중구 서애로5길 17, HB빌딩 2층', 'TEL. 02-2275-3758', 'FAX. 02-2275-3759'],
        footerMenu: ['회사소개', '오시는길', '이용약관', '개인정보수집 및 이용안내', '개인정보 처리방침', '저작권 및 책임의 한계'],
        inquiryLabels: ['회사명', '담당자', '연락처', '내용'],
        inquiryPlaceholders: ['회사명을 입력하세요', '담당자를 입력하세요', '010-0000-0000', '문의내용을 입력하세요'],
        inquiryTerms: '[필수] 개인정보 수집 및 이용에 동의합니다',
        inquiryButton: '문의하기',
        modalClose: '닫기',
        confirmButtons: ['취소', '확인'],
        companyInfo: ['현아이엔씨(주)', '대표: 권주홍', '사업자번호: 688-86-03757'],
        footerCopyright: 'COPYRIGHT © 2024 현아이엔씨(주) ALL RIGHTS RESERVED.'
    },
    en: {
        htmlLang: 'en',
        metaDescription: 'MESGRIP - Integrated management solution for print operations',
        title: 'MESGRIP - Smart Print Production Management',
        nav: ['Home', 'Solutions', 'Service Plans', 'Benefits', 'Try Demo'],
        heroBadge: 'Digital Innovation in Printing',
        heroTitle: 'Smarter Print Production Management<br>Start with <span class="highlight">MESGRIP</span>',
        heroDescription: 'An all-in-one integrated solution<br>from order to production and settlement',
        heroButtons: ['Start Demo', 'Learn More'],
        sectionTitles: ['Everything in One Integrated Platform', 'Service Plans', 'Expected Benefits of MESGRIP', 'Have Questions? Contact Us Now'],
        sectionDescriptions: [
            'Manage every printing workflow in one unified system',
            'Choose the best plan for your business size',
            'Accelerate growth with proven outcomes',
            'We will get back to you as quickly as possible.'
        ],
        solutionTitles: ['Order Management', 'Production Management', 'Outsourcing Management', 'Package Management', 'Logistics Management', 'Material Management', 'Settlement Management', 'Analytics Management'],
        solutionDescriptions: [
            'Manage each client order in real time from job registration to quotation and order confirmation, and announce updates immediately.',
            'Track each process step at a glance and automatically generate work orders to build an efficient production workflow.',
            'Collaborate with partners in real time, from outsourcing requests to quality inspection, in one smart workflow.',
            'Bundle multiple individual items into one package and manage package-level costs and schedules in one place.',
            'Track delivery status in real time from inbound/outbound registration to delivery scheduling and vehicle assignment.',
            'Monitor material in/out and inventory status in real time, and manage efficiently with safety stock alerts.',
            'Register sales/purchase data, manage settlement by client, and integrate e-tax invoices for smarter settlement.',
            'Analyze sales and production metrics, review client performance, and monitor key results on a tailored dashboard.'
        ],
        solutionFeatures: [
            'Job registration and updates', 'Automatic quotation issuance', 'Order progress tracking', 'Client status lookup', 'Real-time change notifications',
            'Process progress management', 'Automatic work order generation', 'Real-time production monitoring', 'Equipment utilization analysis', 'Defect rate tracking',
            'Outsourcing vendor registration and rating', 'Outsourcing order and progress control', 'Automatic outsourcing cost settlement', 'Real-time partner communication', 'Quality inspection workflow',
            'Bulk multi-item registration', 'Set product composition management', 'Package-level cost calculation', 'Integrated schedule management', 'Automatic shipment sequence optimization',
            'Inbound/outbound registration and tracking', 'Delivery schedule management', 'Vehicle dispatch optimization', 'Real-time delivery tracking', 'Delivery completion notifications',
            'Material in/out management', 'Real-time inventory visibility', 'Safety stock alert feature', 'Automatic purchase recommendation', 'Material consumption analysis',
            'Sales/purchase data registration', 'Client-wise settlement management', 'Electronic tax invoice integration', 'Collection/payment schedule management', 'P&L analysis and reports',
            'Sales/production statistical analysis', 'Client performance lookup', 'Period-over-period comparison', 'Item profitability analysis', 'Custom dashboard support'
        ],
        productBadges: ['Small Business', 'General Business', 'SME'],
        productDescriptions: ['For small printing companies', 'For mid-size printing companies', 'For growing small and medium printers'],
        productPrices: ['KRW 300,000 / month', 'KRW 500,000 / month', 'KRW 800,000 / month'],
        productFeatures: [
            'Basic setup', 'Shop-floor management', 'Settlement management', 'Board', '5 users',
            'Basic setup', 'Shop-floor management', 'Settlement management (A/R status by client)', 'Messages (FAX, SMS, Email)', 'Board', '10 users',
            'Basic setup', 'Shop-floor management (Package)', 'Settlement management (A/R status by client)', 'Messages (FAX, SMS, Email)', 'Material management', 'Analytics management', 'Board', '20 users'
        ],
        productNotice: '* KRW 20,000 per additional account',
        productButtons: ['Get Started', 'Get Started', 'Get Started'],
        benefitTitles: ['30% Higher Work Efficiency', '20% Cost Reduction', 'Improved Quality', '95% On-Time Delivery', 'Data-Driven Decisions', 'Stronger Collaboration'],
        benefitDescriptions: [
            'Automated workflows and real-time information sharing<br>reduce repetitive tasks and boost productivity.',
            'Inventory optimization and lower defect rates<br>effectively reduce operating costs.',
            'Systematic process management and quality inspections<br>minimize defects and improve quality.',
            'Real-time progress tracking and schedule optimization<br>greatly improve customer satisfaction.',
            'Integrated dashboards and detailed analytics<br>support accurate management decisions.',
            'Real-time cross-team information sharing<br>enables smooth communication.'
        ],
        imageAlts: {
            processDiagrams: ['Order process', 'Production process', 'Outsourcing process', 'Package process', 'Logistics process', 'Material process', 'Settlement process', 'Analytics process'],
            screenshots: ['Order management screen', 'Production management screen', 'Outsourcing management screen', 'Package management screen', 'Logistics management screen', 'Material management screen 1', 'Material management screen 2', 'Settlement management screen 1', 'Settlement management screen 2', 'Analytics management screen 1', 'Analytics management screen 2']
        },
        footerContact: ['2F, HB Building, 17 Seoae-ro 5-gil, Jung-gu, Seoul, Republic of Korea', 'TEL. +82-2-2275-3758', 'FAX. +82-2-2275-3759'],
        footerMenu: ['About Us', 'Directions', 'Terms of Use', 'Privacy Collection & Use', 'Privacy Policy', 'Copyright & Liability Limits'],
        inquiryLabels: ['Company Name', 'Contact Person', 'Phone', 'Message'],
        inquiryPlaceholders: ['Enter company name', 'Enter contact person', '010-0000-0000', 'Enter your inquiry'],
        inquiryTerms: '[Required] I agree to the collection and use of personal information',
        inquiryButton: 'Send Inquiry',
        modalClose: 'Close',
        confirmButtons: ['Cancel', 'OK'],
        companyInfo: ['HYUN INC Co., Ltd.', 'CEO: Joo Hong Kwon', 'Business No.: 688-86-03757'],
        footerCopyright: 'COPYRIGHT © 2024 HYUN INC Co., Ltd. ALL RIGHTS RESERVED.'
    }
};

function getText(key) {
    return I18N[currentLanguage][key];
}

function setTextByIndex(selector, values) {
    $(selector).each(function(index) {
        if (values[index] !== undefined) {
            $(this).text(values[index]);
        }
    });
}

function applyLanguage() {
    const t = I18N[currentLanguage];
    $('html').attr('lang', t.htmlLang);
    $('meta[name="description"]').attr('content', t.metaDescription);
    document.title = t.title;

    setTextByIndex('.nav .nav-link', t.nav);
    $('.hero-badge').text(t.heroBadge);
    $('.hero-title').html(t.heroTitle);
    $('.hero-description').html(t.heroDescription);
    setTextByIndex('.hero-buttons a span', t.heroButtons);
    setTextByIndex('.section-title', t.sectionTitles);
    setTextByIndex('.section-description', t.sectionDescriptions);
    setTextByIndex('.solution-title', t.solutionTitles);
    setTextByIndex('.solution-description', t.solutionDescriptions);
    setTextByIndex('.solution-features li', t.solutionFeatures);
    setTextByIndex('.product-badge', t.productBadges);
    setTextByIndex('.product-description', t.productDescriptions);
    setTextByIndex('.price-amount', t.productPrices);
    setTextByIndex('.product-features li', t.productFeatures);
    setTextByIndex('.btn-product', t.productButtons);
    $('.products-notice').text(t.productNotice);
    setTextByIndex('.benefit-title', t.benefitTitles);
    $('.benefit-description').each(function(index) {
        if (t.benefitDescriptions[index] !== undefined) {
            $(this).html(t.benefitDescriptions[index]);
        }
    });
    setTextByIndex('.footer-menu a', t.footerMenu);
    $('.footer-link-ko-only').toggle(currentLanguage === 'ko');
    setTextByIndex('.footer-info p', t.footerContact);
    $('.process-diagram').each(function(index) {
        if (t.imageAlts.processDiagrams[index] !== undefined) {
            $(this).attr('alt', t.imageAlts.processDiagrams[index]);
        }
    });
    $('.solution-screenshot').each(function(index) {
        if (t.imageAlts.screenshots[index] !== undefined) {
            $(this).attr('alt', t.imageAlts.screenshots[index]);
        }
    });
    setTextByIndex('.apply-form .form-group > label', t.inquiryLabels);

    const inquiryInputs = ['#cNm', '#cManagerNm', '#cManagerTel', '#cContent'];
    inquiryInputs.forEach(function(selector, index) {
        if (t.inquiryPlaceholders[index] !== undefined) {
            $(selector).attr('placeholder', t.inquiryPlaceholders[index]);
        }
    });

    $('.apply-form .terms-item .checkbox-label span').text(t.inquiryTerms);
    $('#submitBtn span').text(t.inquiryButton);
    $('#closeModalBtn').text(t.modalClose);
    setTextByIndex('#confirmCancelBtn, #confirmOkBtn', t.confirmButtons);
    setTextByIndex('.footer-company p', t.companyInfo);
    $('.footer-bottom p').text(t.footerCopyright);

    switchImagesByLanguage();
    $('.lang-btn').removeClass('active');
    $('.lang-btn[data-lang="' + currentLanguage + '"]').addClass('active');
}

function switchImagesByLanguage() {
    $('.process-diagram, .solution-screenshot').each(function() {
        const $img = $(this);
        if (!$img.attr('data-original-src')) {
            $img.attr('data-original-src', $img.attr('src'));
        }

        const originalSrc = $img.attr('data-original-src');
        if (currentLanguage === 'ko') {
            $img.attr('src', originalSrc);
            return;
        }

        const enSrc = originalSrc.replace(/\/([^\/?#]+)(\?[^#]*)?(#.*)?$/, '/eng/$1$2$3');
        $img.off('error.i18n').on('error.i18n', function() {
            $img.attr('src', originalSrc);
        });
        $img.attr('src', enSrc);
    });
}

function initLanguageSwitcher() {
    $('.lang-btn').on('click', function() {
        const lang = $(this).data('lang');
        if (lang !== 'ko' && lang !== 'en') {
            return;
        }
        currentLanguage = lang;
        localStorage.setItem('mesgrip-lang', currentLanguage);
        applyLanguage();
    });

    applyLanguage();
}

function isInquiryForm() {
    return $('#cManagerNm').length > 0 && $('#cContent').length > 0;
}

// ==========================================
// 초기화
// ==========================================
// ==========================================
// 상품 선택 버튼 클릭 핸들러
// ==========================================
function initProductSelection() {
    $('.btn-product[data-product]').on('click', function(e) {
        e.preventDefault();
        
        const sSeq = $(this).data('product'); // 1, 2, 3
        
        // 신청 양식의 상품 선택 드롭다운에 자동 선택
        $('#sSeq').val(sSeq);
        
        // 선택된 것을 시각적으로 표시
        $('#sSeq').css({
            'background-color': '#fff3cd',
            'transition': 'background-color 0.5s ease'
        });
        
        // 2초 후 원래 색상으로 복원
        setTimeout(function() {
            $('#sSeq').css('background-color', '');
        }, 2000);
        
        // 신청 양식으로 부드럽게 스크롤
        $('html, body').animate({
            scrollTop: $('#apply').offset().top - 100
        }, {
            duration: 1000,
            easing: 'easeInOutQuart',
            complete: function() {
                // 스크롤 완료 후 포커스
                $('#cNm').focus();
            }
        });
    });
}

// ==========================================
// 히어로 버튼 스크롤 핸들러
// ==========================================
function initHeroButtons() {
    $('.hero-buttons a').on('click', function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        
        if (target && target.startsWith('#')) {
            $('html, body').animate({
                scrollTop: $(target).offset().top - 80
            }, 1000, 'easeInOutQuart');
        }
    });
}

$(document).ready(function() {
    initLanguageSwitcher();
    initNavigation();
    initScrollEffects();
    initFormHandlers();
    initTermsModal();
    initPhoneFormat();
    initBusinessNumberFormat();
    initDomainCheck();
    initProductSelection();
    initHeroButtons();
    
    // 푸터 모달 초기화
    if (typeof initFooterModals === 'function') {
        initFooterModals();
    }
});

// ==========================================
// 네비게이션
// ==========================================
function initNavigation() {
    // 로고 클릭 시 최상단으로 스크롤
    $('.logo').on('click', function() {
        $('html, body').animate({
            scrollTop: 0
        }, 1000, 'easeInOutQuart');
        
        // 홈 메뉴 활성화
        $('.nav-link').removeClass('active');
        $('.nav-link[href="#home"]').addClass('active');
    });
    
    // 모바일 메뉴 토글
    $('#mobileMenuBtn').on('click', function(e) {
        e.stopPropagation();
        $(this).toggleClass('active');
        $('.nav').toggleClass('active');
    });
    
    // 스크롤 시 헤더 스타일 변경
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('.header').addClass('scrolled');
        } else {
            $('.header').removeClass('scrolled');
        }
    });

    // 네비게이션 링크 클릭 이벤트
    $('.nav-link').on('click', function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        
        // 스크롤 애니메이션 (부드러운 감속 효과)
        $('html, body').animate({
            scrollTop: $(target).offset().top - 80
        }, 1000, 'easeInOutQuart');

        // active 클래스 업데이트
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        
        // 모바일 메뉴 닫기 (약간의 지연)
        setTimeout(function() {
            $('#mobileMenuBtn').removeClass('active');
            $('.nav').removeClass('active');
        }, 100);
    });
    
    // 메뉴 외부 클릭 시 닫기
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.nav').length && !$(e.target).closest('#mobileMenuBtn').length) {
            $('#mobileMenuBtn').removeClass('active');
            $('.nav').removeClass('active');
        }
    });
}

// ==========================================
// 스크롤 효과
// ==========================================
function initScrollEffects() {
    // Scroll to Top 버튼
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('#scrollToTop').addClass('active');
        } else {
            $('#scrollToTop').removeClass('active');
        }
    });

    $('#scrollToTop').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 1000, 'easeInOutQuart');
        return false;
    });

    // AOS (Animate On Scroll) 간단 구현
    $(window).scroll(function() {
        $('[data-aos]').each(function() {
            const elementTop = $(this).offset().top;
            const windowBottom = $(window).scrollTop() + $(window).height();

            if (elementTop < windowBottom - 100) {
                $(this).css({
                    'opacity': '1',
                    'transform': 'translateY(0)'
                });
            }
        });
    });

    // 초기 스타일 설정
    $('[data-aos]').css({
        'opacity': '0',
        'transform': 'translateY(30px)',
        'transition': 'all 0.6s ease'
    });
}

// ==========================================
// 전화번호 자동 포맷
// ==========================================
function initPhoneFormat() {
    $('#cTel').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        let formatted = '';

        if (value.length <= 3) {
            formatted = value;
        } else if (value.length <= 7) {
            formatted = value.substr(0, 3) + '-' + value.substr(3);
        } else if (value.length <= 11) {
            formatted = value.substr(0, 3) + '-' + value.substr(3, 4) + '-' + value.substr(7);
        } else {
            formatted = value.substr(0, 3) + '-' + value.substr(3, 4) + '-' + value.substr(7, 4);
        }

        $(this).val(formatted);
    });

    $('#cManagerTel').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        let formatted = '';

        if (value.length <= 3) {
            formatted = value;
        } else if (value.length <= 7) {
            formatted = value.substr(0, 3) + '-' + value.substr(3);
        } else if (value.length <= 11) {
            formatted = value.substr(0, 3) + '-' + value.substr(3, 4) + '-' + value.substr(7);
        } else {
            formatted = value.substr(0, 3) + '-' + value.substr(3, 4) + '-' + value.substr(7, 4);
        }

        $(this).val(formatted);
    });
}

// ==========================================
// HOST명 (cDomain) 입력 검증 및 체크
// ==========================================
function initDomainCheck() {
    // keyup 이벤트: 영문/숫자만 허용, 소문자로 변환
    $('#cDomain').on('keyup', function(e) {
        let $this = $(this);
        let v = $this.val();
        
        if (v) {
            v = v.trim().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            $this.val(v);
        } else {
            $this.val('');
        }
        
        // 입력 시 체크 상태 리셋
        $('#cDomainCheck').val('N');
        $('.cDomainMessage').text('').removeClass('success error');
        $this.css('border-color', '');
    });

    // focusout 이벤트: 도메인 중복 체크
    $('#cDomain').on('focusout', function(e) {
        let $this = $(this);
        let $message = $('.cDomainMessage');
        let $check = $('#cDomainCheck');
        let cDomain = $this.val();
        
        cDomain = cDomain.trim().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        $this.val(cDomain);
        
        if (cDomain) {
            // 체크 중 표시
            $message.text('확인 중...').removeClass('success error');
            
            // API 호출
            $.ajax({
                url: API_URL,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    ctl: 'company',
                    cmd: 'joinDomainCheck',
                    cDomain: cDomain.trim().toLowerCase()
                }),
                success: function(response) {
                    if (response.code === 0) {
                        // 사용 가능
                        $this.css('border-color', 'var(--success-color)');
                        $message.text('사용가능').removeClass('error').addClass('success');
                        $check.val('Y');
                        checkFormValidity();
                    } else {
                        // 사용 불가 (이미 사용 중)
                        $this.css('border-color', 'var(--error-color)');
                        $message.text('사용불가 (이미 사용 중)').removeClass('success').addClass('error');
                        $check.val('N');
                        checkFormValidity();
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Domain Check Error:', error);
                    $message.text('확인 중 오류가 발생했습니다').removeClass('success').addClass('error');
                    $check.val('N');
                    checkFormValidity();
                }
            });
        } else {
            $message.text('').removeClass('success error');
            $check.val('N');
            checkFormValidity();
        }
    });
}

// ==========================================
// 사업자등록번호 자동 포맷
// ==========================================
function initBusinessNumberFormat() {
    $('#cBizNo').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        let formatted = '';

        if (value.length <= 3) {
            formatted = value;
        } else if (value.length <= 5) {
            formatted = value.substr(0, 3) + '-' + value.substr(3);
        } else {
            formatted = value.substr(0, 3) + '-' + value.substr(3, 2) + '-' + value.substr(5, 5);
        }

        $(this).val(formatted);
        
        // 입력 시 체크 상태 리셋
        $('#cBizNoCheck').val('N');
        $('.cBizNoMessage').text('').removeClass('success error');
        $(this).css('border-color', '');
        
        // 10자리 입력 완료 시 자동 체크
        if (value.length === 10) {
            // 0.5초 후 자동 체크 (사용자가 계속 입력 중일 수 있으므로)
            setTimeout(function() {
                const currentValue = $('#cBizNo').val().replace(/[^0-9]/g, '');
                if (currentValue.length === 10) {
                    checkBusinessNumber();
                }
            }, 500);
        }
    });

    // 사업자등록번호 포커스 아웃 시에도 체크
    $('#cBizNo').on('focusout', function() {
        const value = $(this).val().replace(/[^0-9]/g, '');
        if (value.length === 10) {
            checkBusinessNumber();
        }
    });

    // 종사업장번호 입력 시
    $('#cBizNoNum').on('input', function() {
        // 입력 시 체크 상태 리셋
        $('#cBizNoCheck').val('N');
        $('.cBizNoMessage').text('').removeClass('success error');
        $('#cBizNo').css('border-color', '');
        
        // 4자리 입력 완료 시 자동 체크 (사업자번호가 있는 경우)
        const value = $(this).val().replace(/[^0-9]/g, '');
        const cBizNo = $('#cBizNo').val().replace(/[^0-9]/g, '');
        
        if (value.length === 4 && cBizNo.length === 10) {
            setTimeout(function() {
                const currentValue = $('#cBizNoNum').val().replace(/[^0-9]/g, '');
                if (currentValue.length === 4) {
                    checkBusinessNumber();
                }
            }, 500);
        }
    });

    // 종사업장번호 포커스 아웃 시에도 체크
    $('#cBizNoNum').on('focusout', function() {
        const cBizNo = $('#cBizNo').val().replace(/[^0-9]/g, '');
        if (cBizNo.length === 10) {
            checkBusinessNumber();
        }
    });
}

// ==========================================
// 사업자번호 등록 여부 체크
// ==========================================
function checkBusinessNumber() {
    const cBizNo = $('#cBizNo').val().replace(/[^0-9]/g, '');
    const cBizNoNum = $('#cBizNoNum').val().trim();
    const $message = $('.cBizNoMessage');
    const $input = $('#cBizNo');

    // 사업자번호가 비어있으면 체크 안함
    if (!cBizNo) {
        $message.text('').removeClass('success error');
        $('#cBizNoCheck').val('N');
        $input.css('border-color', '');
        return;
    }

    // 사업자번호 길이 체크 (10자리)
    if (cBizNo.length !== 10) {
        $message.text('사업자등록번호는 10자리여야 합니다').removeClass('success').addClass('error');
        $('#cBizNoCheck').val('N');
        $input.css('border-color', 'var(--error-color)');
        return;
    }

    // 체크 중 표시
    $message.text('확인 중...').removeClass('success error');
    $input.css('border-color', '');

    // API 호출 - MainController.js의 joinBizNoCheck 사용
    $.ajax({
        url: API_URL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ctl: 'company',
            cmd: 'joinBizNoCheck',
            cBizNo: cBizNo,
            cBizNoNum: cBizNoNum
        }),
        success: function(response) {
            if (response.code === 0) {
                // 등록 가능 (code: 0)
                $message.text('등록가능').removeClass('error').addClass('success');
                $('#cBizNoCheck').val('Y');
                $input.css('border-color', 'var(--success-color)');
                
                // 폼 유효성 재검사
                checkFormValidity();
            } else {
                // 등록 불가 (이미 사용 중이거나 오류)
                $message.text(response.message || '등록불가 (이미 사용 중)').removeClass('success').addClass('error');
                $('#cBizNoCheck').val('N');
                $input.css('border-color', 'var(--error-color)');
                
                // 폼 유효성 재검사
                checkFormValidity();
            }
        },
        error: function(xhr, status, error) {
            console.error('Business Number Check Error:', error);
            $message.text('확인 중 오류가 발생했습니다').removeClass('success').addClass('error');
            $('#cBizNoCheck').val('N');
            $input.css('border-color', 'var(--error-color)');
            
            // 폼 유효성 재검사
            checkFormValidity();
        }
    });
}

// ==========================================
// 폼 핸들러
// ==========================================
function initFormHandlers() {
    const inquiryMode = isInquiryForm();

    if (inquiryMode) {
        $('#cNm, #cManagerNm, #cManagerTel, #cContent').on('input change', function() {
            checkFormValidity();
        });

        $('#informationYn').change(function() {
            checkFormValidity();
        });
    }

    // 주소 검색
    $('#searchAddressBtn').click(function() {
        openAddressSearch();
    });

    // 이메일 인증번호 발송
    $('#sendVerifyBtn').click(function() {
        sendVerificationEmail();
    });

    // 인증번호 확인
    $('#checkVerifyBtn').click(function() {
        checkVerificationCode();
    });

    // 전체 동의 체크박스
    $('#agreeAll').change(function() {
        const isChecked = $(this).prop('checked');
        $('.agree-checkbox').prop('checked', isChecked);
        $('#marketingYn').prop('checked', isChecked);
        checkFormValidity();
    });

    // 개별 약관 체크박스
    $('.agree-checkbox, #marketingYn').change(function() {
        const allChecked = $('.agree-checkbox').length === $('.agree-checkbox:checked').length &&
                          $('#marketingYn').prop('checked');
        $('#agreeAll').prop('checked', allChecked);
        checkFormValidity();
    });

    // 필수 입력 필드 변경 시 폼 유효성 검사
    if (!inquiryMode) {
        $('#cNm, #cBizNo, #cOwnerNm, #cTel, #cInvoiceEmail, #sSeq, #cDomain, #eNm, #eId, #ePwd, #ePwdRe').on('input change', function() {
            checkFormValidity();
        });
    }

    // 비밀번호 확인 실시간 검증
    $('#ePwdRe').on('input', function() {
        const password = $('#ePwd').val();
        const confirm = $(this).val();
        
        if (confirm && password !== confirm) {
            $(this).css('border-color', 'var(--error-color)');
        } else {
            $(this).css('border-color', 'var(--border-color)');
        }
    });

    // 폼 제출
    $('#applyForm').submit(function(e) {
        e.preventDefault();
        submitApplication();
    });
}

// ==========================================
// 이메일 인증번호 발송
// ==========================================
function sendVerificationEmail() {
    const email = $('#cInvoiceEmail').val().trim();

    if (!email) {
        showMessage('error', '이메일을 입력해주세요.');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('error', '올바른 이메일 형식이 아닙니다.');
        return;
    }

    // 버튼 비활성화
    $('#sendVerifyBtn').prop('disabled', true).text('발송 중...');

    // API 호출
    $.ajax({
        url: API_URL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ctl: 'common',
            cmd: 'joinTokenIssue',
            cInvoiceEmail: email
        }),
        success: function(response) {
            if (response.code === 0 && response.data && response.data.jtSeq) {
                jtSeq = response.data.jtSeq;
                showMessage('success', '인증번호가 발송되었습니다. 이메일을 확인해주세요.');
                
                // 인증 입력 필드 표시 및 활성화
                $('#verificationGroup').slideDown();
                $('#verifyCode').prop('disabled', false).val('');
                $('#checkVerifyBtn').prop('disabled', false).text('확인');
                
                // 타이머 시작
                startTimer();
                
                // 이메일 입력 필드 비활성화
                $('#cInvoiceEmail').prop('disabled', true);
                $('#sendVerifyBtn').text('재발송').prop('disabled', false);
            } else {
                showMessage('error', '인증번호 발송에 실패했습니다. 다시 시도해주세요.');
                $('#sendVerifyBtn').prop('disabled', false).text('인증번호 발송');
            }
        },
        error: function(xhr, status, error) {
            console.error('API Error:', error);
            showMessage('error', '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            $('#sendVerifyBtn').prop('disabled', false).text('인증번호 발송');
        }
    });
}

// ==========================================
// 인증번호 확인
// ==========================================
function checkVerificationCode() {
    const code = $('#verifyCode').val().trim();

    if (!code) {
        showVerificationStatus('error', '인증번호를 입력해주세요.');
        return;
    }

    if (code.length !== 6) {
        showVerificationStatus('error', '인증번호는 6자리입니다.');
        return;
    }

    if (!jtSeq) {
        showVerificationStatus('error', '인증번호를 먼저 발송해주세요.');
        return;
    }

    // 버튼 비활성화
    $('#checkVerifyBtn').prop('disabled', true).text('확인 중...');

    // API 호출
    $.ajax({
        url: API_URL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ctl: 'common',
            cmd: 'joinTokenCheck',
            jtSeq: jtSeq,
            jtKey: code
        }),
        success: function(response) {
            if (response.code === 0 && response.data === true) {
                isVerified = true;
                showVerificationStatus('success', '✓ 이메일 인증이 완료되었습니다.');
                
                // 타이머 중지
                clearInterval(verificationTimer);
                $('#timer').text('인증완료').css('color', '#10b981');
                
                // 인증 필드 및 이메일 필드 비활성화
                $('#cEmail').prop('readonly', true).css({
                    'background-color': '#f8fafc',
                    'cursor': 'not-allowed'
                });
                $('#verifyCode').prop('disabled', true);
                $('#checkVerifyBtn').prop('disabled', true).text('인증완료');
                $('#sendVerifyBtn').prop('disabled', true);
                
                // 폼 유효성 검사
                checkFormValidity();
            } else {
                showVerificationStatus('error', '인증번호가 일치하지 않습니다.');
                $('#checkVerifyBtn').prop('disabled', false).text('확인');
            }
        },
        error: function(xhr, status, error) {
            console.error('API Error:', error);
            showVerificationStatus('error', '서버 오류가 발생했습니다. 다시 시도해주세요.');
            $('#checkVerifyBtn').prop('disabled', false).text('확인');
        }
    });
}

// ==========================================
// 타이머 시작
// ==========================================
function startTimer() {
    // 기존 타이머 중지
    if (verificationTimer) {
        clearInterval(verificationTimer);
    }

    timeLeft = 300; // 5분 리셋
    updateTimerDisplay();

    verificationTimer = setInterval(function() {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(verificationTimer);
            showVerificationStatus('error', '인증 시간이 만료되었습니다. 다시 발송해주세요.');
            $('#verifyCode').prop('disabled', true).val('');
            $('#checkVerifyBtn').prop('disabled', true);
            $('#timer').text('시간만료').css('color', '#ef4444');
        }
    }, 1000);
}

// ==========================================
// 타이머 표시 업데이트
// ==========================================
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    $('#timer').text(
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
    );
}

// ==========================================
// Daum 주소 검색 (MainController.js와 동일한 방식)
// ==========================================
function openAddressSearch() {
    new daum.Postcode({
        oncomplete: function(data) {
            // data.zonecode 새 우편번호
            let roadAddr = data.roadAddress; // 도로명 주소 변수
            $('input[name=cZipcode]').val(data.zonecode);
            $('input[name=cAddr]').val(roadAddr);
            $('input[name=cAddrDetail]').trigger('focus');
        }
    }).open();
}

// ==========================================
// 이메일 유효성 검사
// ==========================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ==========================================
// 메시지 표시
// ==========================================
function showMessage(type, message) {
    // 간단한 알림 (필요시 Toast 라이브러리로 교체 가능)
    alert(message);
}

// ==========================================
// 인증 상태 메시지 표시
// ==========================================
function showVerificationStatus(type, message) {
    const $status = $('#verificationStatus');
    $status.removeClass('success error')
           .addClass(type)
           .text(message)
           .slideDown();
}

// ==========================================
// 폼 유효성 검사
// ==========================================
function checkFormValidity() {
    if (isInquiryForm()) {
        const cNm = $('#cNm').val().trim();
        const cManagerNm = $('#cManagerNm').val().trim();
        const cManagerTel = $('#cManagerTel').val().replace(/[^0-9]/g, '');
        const cContent = $('#cContent').val().trim();
        const informationYn = $('#informationYn').prop('checked');

        const isValid = cNm && cManagerNm && cManagerTel.length >= 9 && cContent && informationYn;
        $('#submitBtn').prop('disabled', !isValid);
        return;
    }

    const cNm = $('#cNm').val().trim();
    const cBizNo = $('#cBizNo').val().replace(/[^0-9]/g, '');
    const cOwnerNm = $('#cOwnerNm').val().trim();
    const cTel = $('#cTel').val().trim();
    const cInvoiceEmail = $('#cInvoiceEmail').val().trim();
    const sSeq = $('#sSeq').val();
    const cDomain = $('#cDomain').val().trim();
    const eNm = $('#eNm').val().trim();
    const eId = $('#eId').val().trim();
    const ePwd = $('#ePwd').val();
    const ePwdRe = $('#ePwdRe').val();
    const useYn = $('#useYn').prop('checked');
    const informationYn = $('#informationYn').prop('checked');
    const thirdPartyYn = $('#thirdPartyYn').prop('checked');
    const cBizNoCheck = $('#cBizNoCheck').val();
    const cDomainCheck = $('#cDomainCheck').val();

    // 비밀번호 일치 여부
    const passwordMatch = ePwd && ePwdRe && ePwd === ePwdRe;
    
    // 비밀번호 길이 체크 (8자 이상)
    const passwordValid = ePwd.length >= 8;
    
    // 사업자번호 체크 (10자리 + 등록 확인)
    const bizNoValid = cBizNo.length === 10 && cBizNoCheck === 'Y';
    
    // 도메인 체크
    const domainValid = cDomain && cDomainCheck === 'Y';

    const isValid = cNm && cBizNo && bizNoValid && cOwnerNm && cTel && cInvoiceEmail && sSeq &&
                   domainValid && eNm && eId && passwordMatch && passwordValid &&
                   isVerified && useYn && informationYn && thirdPartyYn;

    $('#submitBtn').prop('disabled', !isValid);
}

// ==========================================
// 신청서 제출
// ==========================================
function submitApplication() {
    if (isInquiryForm()) {
        submitInquiry();
        return;
    }

    if (!isVerified) {
        alert('이메일 인증을 완료해주세요.');
        return;
    }

    // 필수 약관 확인
    if (!$('#useYn').prop('checked') || 
        !$('#informationYn').prop('checked') || 
        !$('#thirdPartyYn').prop('checked')) {
        alert('필수 약관에 모두 동의해주세요.');
        return;
    }

    // 사업자번호 체크 (필수)
    const cBizNo = $('#cBizNo').val().replace(/[^0-9]/g, '');
    if (!cBizNo) {
        alert('사업자등록번호를 입력해주세요.');
        $('#cBizNo').focus();
        return;
    }
    
    if (cBizNo.length !== 10) {
        alert('사업자등록번호는 10자리여야 합니다.');
        $('#cBizNo').focus();
        return;
    }
    
    if ($('#cBizNoCheck').val() !== 'Y') {
        alert('사업자등록번호 등록 여부를 확인해주세요.');
        $('#cBizNo').focus();
        return;
    }

    // 도메인 체크 (필수)
    if ($('#cDomainCheck').val() !== 'Y') {
        alert('도메인 중복 확인을 해주세요.');
        $('#cDomain').focus();
        return;
    }

    // 비밀번호 확인
    const ePwd = $('#ePwd').val();
    const ePwdRe = $('#ePwdRe').val();
    
    if (ePwd !== ePwdRe) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    if (ePwd.length < 8) {
        alert('비밀번호는 8자 이상이어야 합니다.');
        return;
    }

    // 폼 데이터 수집
    const formData = {
        ctl: 'company',
        cmd: 'join',
        cNm: $('#cNm').val().trim(),
        cBizNo: $('#cBizNo').val().replace(/[^0-9]/g, ''),
        cBizNoNum: $('#cBizNoNum').val().trim(),
        cOwnerNm: $('#cOwnerNm').val().trim(),
        cTel: $('#cTel').val().replace(/[^0-9]/g, ''),
        cInvoiceEmail: $('#cInvoiceEmail').val().trim(),
        sSeq: $('#sSeq').val(),
        cZipcode: $('#cZipcode').val().trim(),
        cAddr: $('#cAddr').val().trim(),
        cAddrDetail: $('#cAddrDetail').val().trim(),
        cDomain: $('#cDomain').val().trim(),
        eNm: $('#eNm').val().trim(),
        eId: $('#eId').val().trim(),
        ePwd: ePwd,
        useYn: $('#useYn').prop('checked') ? 'Y' : 'N',
        informationYn: $('#informationYn').prop('checked') ? 'Y' : 'N',
        thirdPartyYn: $('#thirdPartyYn').prop('checked') ? 'Y' : 'N',
        marketingYn: $('#marketingYn').prop('checked') ? 'Y' : 'N',
        jtSeq: jtSeq
    };

    // 버튼 비활성화
    $('#submitBtn').prop('disabled', true).html('<span>제출 중...</span>');

    // API 호출
    $.ajax({
        url: API_URL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            if (response.code === 0) {
                // 가입 완료 - 사이트 이동 여부 확인
                const cDomain = formData.cDomain;
                const siteUrl = 'https://' + cDomain + '.mesgrip.com';
                
                showConfirm(
                    '가입이 완료되었습니다!',
                    '신청 정보가 메일로 발송 되었습니다.\n3개월 무료 체험이 시작되었습니다.\n신청하신 사이트로 바로 이동하시겠습니까?',
                    siteUrl,
                    function(confirmed) {
                        if (confirmed) {
                            // 사이트로 이동 선택 시
                            window.open(siteUrl, '_blank');
                        }
                        
                        // 폼 초기화
                        resetForm();
                    }
                );
            } else {
                alert('신청 처리 중 오류가 발생했습니다.\n' + (response.message || '다시 시도해주세요.'));
                $('#submitBtn').prop('disabled', false).html(
                    '<span>무료 체험 신청하기</span>' +
                    '<svg class="btn-icon" viewBox="0 0 24 24" fill="none">' +
                    '<path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                    '</svg>'
                );
            }
        },
        error: function(xhr, status, error) {
            console.error('API Error:', error);
            alert('서버 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
            $('#submitBtn').prop('disabled', false).html(
                '<span>무료 체험 신청하기</span>' +
                '<svg class="btn-icon" viewBox="0 0 24 24" fill="none">' +
                '<path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>'
            );
        }
    });
}

function submitInquiry() {
    if (!$('#informationYn').prop('checked')) {
        alert(currentLanguage === 'en'
            ? 'Please agree to the collection and use of personal information.'
            : '개인정보 수집 및 이용에 동의해주세요.');
        return;
    }

    const payload = {
        cNm: $('#cNm').val().trim(),
        cManagerNm: $('#cManagerNm').val().trim(),
        cManagerTel: $('#cManagerTel').val().replace(/[^0-9]/g, ''),
        cContent: $('#cContent').val().trim(),
        informationYn: 'Y'
    };

    if (!payload.cNm || !payload.cManagerNm || !payload.cManagerTel || !payload.cContent) {
        alert(currentLanguage === 'en'
            ? 'Please complete all required fields.'
            : '필수 항목을 모두 입력해주세요.');
        return;
    }

    $('#submitBtn').prop('disabled', true).html('<span>' + (currentLanguage === 'en' ? 'Sending...' : '전송 중...') + '</span>');

    const endpoints = [
        { ctl: 'hompage', cmd: 'userQnaInsert' },
        { ctl: 'homepage', cmd: 'userQnaInsert' }
    ];

    requestInquiry(endpoints, payload);
}

function requestInquiry(endpoints, payload, index = 0) {
    if (index >= endpoints.length) {
        alert(currentLanguage === 'en'
            ? 'An error occurred while sending your inquiry.\nPlease try again.'
            : '문의 접수 중 오류가 발생했습니다.\n다시 시도해주세요.');
        $('#submitBtn').prop('disabled', false).html(
            '<span>' + (currentLanguage === 'en' ? 'Send Inquiry' : '문의하기') + '</span>' +
            '<svg class="btn-icon" viewBox="0 0 24 24" fill="none">' +
            '<path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>'
        );
        return;
    }

    const requestData = Object.assign({}, payload, endpoints[index]);

    $.ajax({
        url: API_URL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
        success: function(response) {
            if (response.code === 0) {
                alert(currentLanguage === 'en'
                    ? 'Your inquiry has been submitted successfully.\nWe will contact you shortly.'
                    : '문의가 정상 접수되었습니다.\n빠른 시일 내에 연락드리겠습니다.');
                $('#applyForm')[0].reset();
                checkFormValidity();
                return;
            }

            requestInquiry(endpoints, payload, index + 1);
        },
        error: function(xhr, status, error) {
            console.error('Inquiry API Error:', error);
            requestInquiry(endpoints, payload, index + 1);
        }
    });
}

// ==========================================
// 폼 초기화
// ==========================================
function resetForm() {
    $('#applyForm')[0].reset();
    $('#verificationGroup').hide();
    $('#verificationStatus').hide();
    $('#cInvoiceEmail').prop('disabled', false);
    $('#verifyCode').prop('disabled', false);
    $('#checkVerifyBtn').prop('disabled', false).text('확인');
    $('#sendVerifyBtn').text('인증번호 발송');
    $('#ePwdRe').css('border-color', 'var(--border-color)');
    
    // 타이머 중지
    if (verificationTimer) {
        clearInterval(verificationTimer);
    }
    
    // 변수 초기화
    jtSeq = null;
    isVerified = false;
    timeLeft = 300;
    
    // 버튼 상태 업데이트
    checkFormValidity();
    
    // 페이지 상단으로 스크롤 (부드러운 감속 효과)
    $('html, body').animate({ scrollTop: 0 }, 1000, 'easeInOutQuart');
}

// ==========================================
// 약관 모달
// ==========================================
function initTermsModal() {
    // 약관 보기 버튼 클릭
    $('.btn-view-terms').click(function() {
        const termsType = $(this).data('terms');
        showTermsModal(termsType);
    });

    // 모달 닫기
    $('#closeModal, #closeModalBtn, .modal-overlay').click(function() {
        closeTermsModal();
    });

    // ESC 키로 모달 닫기
    $(document).keyup(function(e) {
        if (e.key === "Escape") {
            closeTermsModal();
        }
    });
}

// ==========================================
// 약관 모달 열기
// ==========================================
function showTermsModal(type) {
    const terms = termsData[type];
    
    if (!terms) {
        console.error('Terms not found:', type);
        return;
    }

    $('#modalTitle').text(terms.title);
    $('#modalBody').html(terms.content);
    $('#termsModal').addClass('active');
    $('body').css('overflow', 'hidden');
}

// ==========================================
// 약관 모달 닫기
// ==========================================
function closeTermsModal() {
    $('#termsModal').removeClass('active');
    $('body').css('overflow', 'auto');
}

// ==========================================
// 커스텀 Confirm 모달
// ==========================================
function showConfirm(title, message, url, callback) {
    $('#confirmTitle').text(title);
    $('#confirmMessage').text(message);
    
    if (url) {
        $('#confirmUrl').text(url).show();
    } else {
        $('#confirmUrl').hide();
    }
    
    $('#confirmModal').addClass('active');
    $('body').css('overflow', 'hidden');
    
    // 버튼 이벤트 (기존 이벤트 제거 후 새로 바인딩)
    $('#confirmOkBtn').off('click').on('click', function() {
        closeConfirmModal();
        if (callback) callback(true);
    });
    
    $('#confirmCancelBtn').off('click').on('click', function() {
        closeConfirmModal();
        if (callback) callback(false);
    });
    
    // 오버레이 클릭 시 취소
    $('#confirmModal .modal-overlay').off('click').on('click', function() {
        closeConfirmModal();
        if (callback) callback(false);
    });
    
    // ESC 키로 닫기
    $(document).off('keyup.confirm').on('keyup.confirm', function(e) {
        if (e.key === "Escape") {
            closeConfirmModal();
            if (callback) callback(false);
        }
    });
}

function closeConfirmModal() {
    $('#confirmModal').removeClass('active');
    $('body').css('overflow', 'auto');
    $(document).off('keyup.confirm');
}

function goDemo() {
    setCookie('demoId', 'demo', 60, undefined, 'mesgrip.com');
    setCookie('demoPwd', '123456789',  60, undefined, 'mesgrip.com');
    window.open('https://demo.mesgrip.com', '_blank');
}
function setCookie(name, value, exp, path, domain) {
    var date = new Date();
    date.setTime(date.getTime() + exp*1000); // 일
    var cookieText=encodeURIComponent(name) + "=" + encodeURIComponent(value);
    cookieText+=(exp ? '; EXPIRES='+date.toUTCString():'');
    cookieText+=(path ? '; PATH='+path : '; PATH=/');
    cookieText+=(domain ? '; DOMAIN='+domain : '');
    document.cookie=cookieText;
}

function getCookie(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? decodeURIComponent(value[2]) : null;
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
}
