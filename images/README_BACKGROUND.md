# 배경 이미지 설정 가이드

## 현재 상태
- 현재는 SVG로 만든 정적 인쇄 장비 배경이 적용되어 있습니다.
- 인쇄소 장비에 종이가 투입되는 부분을 클로즈업한 이미지입니다.
- 애니메이션 없이 깔끔한 정적 이미지로 구성되어 있습니다.

## 실제 사진으로 교체하기

더 실감나는 배경을 원하시면 다음 방법으로 실제 인쇄 장비 사진을 사용할 수 있습니다:

### 방법 1: 직접 촬영한 사진 사용

1. 인쇄소의 대형 인쇄 장비를 촬영합니다
2. 특히 **용지가 투입되는 부분**을 클로즈업으로 촬영
3. 이미지를 `printing-machine-photo.jpg` 이름으로 이 폴더에 저장
4. `css/style.css`에서 다음과 같이 수정:

```css
.hero {
    background: 
        linear-gradient(135deg, rgba(102, 126, 234, 0.88) 0%, rgba(118, 75, 162, 0.88) 100%),
        url('../images/printing-machine-photo.jpg') center center;
    background-size: cover;
    background-attachment: fixed;
}
```

### 방법 2: 무료 스톡 이미지 사용

다음 사이트에서 무료 인쇄 장비 이미지를 다운로드할 수 있습니다:

#### Unsplash (무료, 상업적 사용 가능)
- URL: https://unsplash.com/s/photos/printing-press
- 검색어: "printing press", "offset printing", "commercial printer"

#### Pixabay (무료, 상업적 사용 가능)
- URL: https://pixabay.com/
- 검색어: "printing machine", "offset press"

#### Pexels (무료, 상업적 사용 가능)
- URL: https://www.pexels.com/
- 검색어: "printing machine", "industrial printer"

### 추천 이미지 특성

- **해상도**: 최소 1920x1080px (Full HD) 이상
- **구도**: 용지 투입구 클로즈업 또는 인쇄 실린더 부분
- **색감**: 어두운 톤이 텍스트 가독성에 좋음
- **포커스**: 기계의 디테일이 선명하게 보이는 이미지

### 최적화 팁

1. 이미지를 WebP 포맷으로 변환하여 로딩 속도 향상:
   ```bash
   # ImageMagick 사용 예시
   convert printing-machine-photo.jpg -quality 85 printing-machine-photo.webp
   ```

2. CSS에서 WebP 및 fallback 설정:
   ```css
   .hero {
       background: 
           linear-gradient(135deg, rgba(102, 126, 234, 0.88) 0%, rgba(118, 75, 162, 0.88) 100%),
           url('../images/printing-machine-photo.webp') center center;
   }
   
   /* WebP 미지원 브라우저 대응 */
   .no-webp .hero {
       background: 
           linear-gradient(135deg, rgba(102, 126, 234, 0.88) 0%, rgba(118, 75, 162, 0.88) 100%),
           url('../images/printing-machine-photo.jpg') center center;
   }
   ```

## 현재 SVG 배경의 장점

- **경량**: 파일 크기가 작아 빠른 로딩
- **확장성**: 어떤 해상도에서도 선명함
- **깔끔함**: 애니메이션 없이 전문적이고 안정적인 느낌
- **커스터마이징**: 색상과 효과를 쉽게 수정 가능
- **디테일**: 종이 투입 부분, 롤러, 가이드 레일 등 세밀한 표현

## 문의

배경 이미지 관련 문제가 있으면 `css/style.css`의 `.hero` 섹션을 확인하세요.

