// ==========================================
// API 설정
// ==========================================
const API_URL = 'http://127.0.0.1:8024/public/ws';

// ==========================================
// 전역 변수
// ==========================================
let verificationTimer = null;
let timeLeft = 300; // 5분 (300초)
let jtSeq = null; // 인증관리번호
let isVerified = false; // 이메일 인증 완료 여부

// ==========================================
// 초기화
// ==========================================
// ==========================================
// 상품 선택 버튼 클릭 핸들러
// ==========================================
function initProductSelection() {
    $('.btn-product[data-product]').on('click', function(e) {
        e.preventDefault();
        
        const sSeq = $(this).data('product'); // 1, 2, 3, 4
        
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
        }, 800, function() {
            // 스크롤 완료 후 포커스
            $('#cNm').focus();
        });
    });
}

$(document).ready(function() {
    initNavigation();
    initScrollEffects();
    initFormHandlers();
    initTermsModal();
    initPhoneFormat();
    initBusinessNumberFormat();
    initDomainCheck();
    initProductSelection();
    
    // 푸터 모달 초기화
    if (typeof initFooterModals === 'function') {
        initFooterModals();
    }
});

// ==========================================
// 네비게이션
// ==========================================
function initNavigation() {
    // 스크롤 시 헤더 스타일 변경
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('.header').addClass('scrolled');
        } else {
            $('.header').removeClass('scrolled');
        }
    });

    // 네비게이션 링크 클릭 이벤트
    $('.nav-link').click(function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        
        $('html, body').animate({
            scrollTop: $(target).offset().top - 80
        }, 600);

        $('.nav-link').removeClass('active');
        $(this).addClass('active');
    });

    // 모바일 메뉴 토글
    $('#mobileMenuBtn').click(function() {
        $('.nav').slideToggle();
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
        $('html, body').animate({ scrollTop: 0 }, 600);
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
        $('#agreeMarketing').prop('checked', isChecked);
        checkFormValidity();
    });

    // 개별 약관 체크박스
    $('.agree-checkbox, #agreeMarketing').change(function() {
        const allChecked = $('.agree-checkbox').length === $('.agree-checkbox:checked').length &&
                          $('#agreeMarketing').prop('checked');
        $('#agreeAll').prop('checked', allChecked);
        checkFormValidity();
    });

    // 필수 입력 필드 변경 시 폼 유효성 검사
    $('#cNm, #cBizNo, #cOwnerNm, #cTel, #cInvoiceEmail, #sSeq, #cDomain, #eNm, #eId, #ePwd, #ePwdRe').on('input change', function() {
        checkFormValidity();
    });

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
                
                // 인증 입력 필드 표시
                $('#verificationGroup').slideDown();
                
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
                
                // 인증 필드 비활성화
                $('#verifyCode').prop('disabled', true);
                $('#checkVerifyBtn').prop('disabled', true).text('인증완료');
                
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
            $('#verifyCode').prop('disabled', true);
            $('#checkVerifyBtn').prop('disabled', true);
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
    const informationYn2 = $('#informationYn2').prop('checked');
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
                   isVerified && useYn && informationYn && informationYn2;

    $('#submitBtn').prop('disabled', !isValid);
}

// ==========================================
// 신청서 제출
// ==========================================
function submitApplication() {
    if (!isVerified) {
        alert('이메일 인증을 완료해주세요.');
        return;
    }

    // 필수 약관 확인
    if (!$('#useYn').prop('checked') || 
        !$('#informationYn').prop('checked') || 
        !$('#informationYn2').prop('checked')) {
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
                    '가입이 완료되었습니다! 🎉',
                    '신청하신 사이트로 바로 이동하시겠습니까?\n3개월 무료 체험이 시작되었습니다.',
                    siteUrl,
                    function(confirmed) {
                        if (confirmed) {
                            // 사이트로 이동 선택 시
                            window.open(siteUrl, '_blank');
                        }
                        
                        // 폼 초기화
                        resetForm();
                        
                        // 완료 메시지
                        setTimeout(function() {
                            alert('로그인 정보는 이메일로 발송되었습니다.');
                        }, 300);
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
    
    // 페이지 상단으로 스크롤
    $('html, body').animate({ scrollTop: 0 }, 600);
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
