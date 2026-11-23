# Orbital Capital · Windows 및 Steam 배포

## Windows에서 빌드하고 실행하기

Windows 10/11 x64에서 프로젝트 폴더를 열고 다음 PowerShell 명령을 실행합니다. 첫 빌드는 Electron 공식 릴리스의 v45.4.1 Windows x64 ZIP을 받아 SHA-256을 검사합니다. 이후 빌드는 로컬 캐시를 재사용합니다. PowerShell, `curl.exe`, `tar.exe`가 있으면 Node.js와 npm 설치 없이 패키징할 수 있습니다. [Electron 패키징 문서](https://www.electronjs.org/docs/latest/tutorial/application-distribution/) · [고정한 Electron 릴리스](https://github.com/electron/electron/releases/tag/v45.4.1)

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\build-windows.ps1
& '.\dist\OrbitalCapital-win-x64\OrbitalCapital.exe'
```

npm이 설치된 개발 환경에서는 `npm run build:win`도 같은 빌드를 실행합니다. 네트워크가 없는 빌드 PC에서는 같은 공식 ZIP을 미리 준비한 뒤 다음처럼 경로를 지정합니다.

```powershell
.\tools\build-windows.ps1 -RuntimeZip 'D:\cache\electron-v45.4.1-win32-x64.zip'
```

배포 단위는 `dist\OrbitalCapital-win-x64\` 폴더 전체입니다. 실행 파일 옆의 DLL, `.pak`, `locales`, `resources`, 런타임 라이선스가 함께 있어야 합니다. `resources\app\game`이 게임 화면과 픽셀 이미지, `resources\app\desktop`이 창과 파일 저장을 담당합니다. 배포본을 종료한 후 같은 명령으로 다시 빌드할 수 있습니다. 이 프로토타입은 코드 서명을 적용하지 않은 Windows x64 폴더 배포본입니다.

## 로컬 저장과 동기화

데스크톱 버전은 Windows 사용자의 Roaming AppData 아래에 다음 파일을 만듭니다.

| 슬롯 | 파일 |
| --- | --- |
| 자동 | `%APPDATA%\OrbitalCapital\saves\auto.json` |
| 수동 | `%APPDATA%\OrbitalCapital\saves\manual.json` |

파일 복사로 백업하거나 복원할 때는 먼저 게임을 종료합니다. 세이브는 UTF-8 JSON입니다. 데스크톱 브리지는 슬롯 이름을 검사하고 같은 슬롯의 쓰기를 호출 순서대로 처리합니다. 임시 파일 쓰기와 디스크 플러시를 마친 뒤 파일 이름을 교체합니다. 쓰는 도중에 프로세스가 종료되어도 기존 슬롯에 불완전한 JSON을 덮어쓰지 않습니다. 브라우저에서 HTML을 열면 해당 브라우저의 로컬 저장소를 사용합니다.

Steamworks에서 해당 앱의 **Application → Steam Cloud**를 열고 사용자별 파일 수와 바이트 한도를 설정합니다. 두 슬롯의 각 쓰기 제한이 8 MiB이므로 두 파일과 16 MiB 이상의 용량을 허용합니다. 아래 내용으로 Auto-Cloud 경로를 하나 만들고 설정을 게시합니다. [Valve Steam Cloud 설정과 테스트](https://partner.steamgames.com/doc/features/cloud)

| 설정 | 값 |
| --- | --- |
| Root | `WinAppDataRoaming` |
| Subdirectory | `OrbitalCapital/saves` |
| Pattern | `*.json` |
| OS | Windows |
| Recursive | 꺼짐 |

게임의 저장과 불러오기는 오프라인에서도 작동합니다. 동기화는 Steam 클라이언트가 연결을 복구했을 때 담당합니다. 현재 경로는 Windows 사용자 단위이므로 같은 Windows 로그인에서 Steam 계정을 전환하면 로컬 슬롯을 공유합니다. 계정별 저장을 도입할 때는 게임의 저장 경로와 Auto-Cloud의 `{64BitSteamID}` 하위 디렉터리를 함께 변경하고 기존 슬롯을 이전합니다. [Valve Auto-Cloud 경로 변수](https://partner.steamgames.com/doc/features/cloud)

## SteamPipe 빌드 업로드

1. Steamworks에서 게임의 App ID와 Windows 콘텐츠용 Depot ID를 확인합니다. 해당 depot을 개발 계정이 보유한 패키지에 포함하고, Windows 시작 옵션의 실행 경로에 `OrbitalCapital.exe`를 입력합니다.
2. Steamworks SDK의 `tools\ContentBuilder\content\OrbitalCapital\`에 배포 폴더 **안의 파일과 하위 폴더 전체**를 복사합니다. 이때 `content\OrbitalCapital\OrbitalCapital.exe`가 존재해야 합니다.
3. 아래 예제를 `tools\ContentBuilder\scripts\orbital.vdf`로 저장합니다. `APP_ID`와 `DEPOT_ID`를 발급받은 숫자로 바꿉니다. SDK, 로그인 정보와 로컬 세이브는 콘텐츠 디렉터리 밖에 둡니다. [Valve SteamPipe 빌드 구성](https://partner.steamgames.com/doc/sdk/uploading)

```text
"AppBuild"
{
    "AppID"       "APP_ID"
    "Desc"        "Orbital Capital Windows x64 0.1.0"
    "ContentRoot" "../content/OrbitalCapital"
    "BuildOutput" "../output"
    "Depots"
    {
        "DEPOT_ID"
        {
            "FileMapping"
            {
                "LocalPath" "*"
                "DepotPath" "."
                "recursive" "1"
            }
        }
    }
}
```

4. `ContentBuilder\builder\steamcmd.exe`를 실행합니다. SteamCMD 프롬프트에서 아래 순서로 입력합니다. 빌드 권한이 있는 계정명과 VDF의 실제 절대 경로를 사용합니다. 인증은 SteamCMD의 안내를 따릅니다. Windows에서는 SDK에 포함된 SteamPipeGUI로도 같은 구성을 업로드할 수 있습니다. [Valve SteamPipe 업로드 절차](https://partner.steamgames.com/doc/sdk/uploading)

```text
login YOUR_BUILD_ACCOUNT
run_app_build "D:\steamworks_sdk\tools\ContentBuilder\scripts\orbital.vdf"
quit
```

5. Steamworks의 **Builds**에서 생성된 Build ID를 비공개 베타 브랜치에 올립니다. 테스트 PC에 Steam으로 설치하고 게임을 종료한 뒤 재실행해 슬롯을 확인합니다. Steam 오프라인 모드에서도 거래·건설·저장이 되는지 확인합니다.
6. Cloud 설정을 켠 테스트 계정으로 온라인 상태에서 저장 후 종료합니다. 동기화가 끝나면 두 번째 PC에서 같은 계정으로 설치해 두 슬롯의 게임 날짜와 잔액을 비교합니다. 콘솔의 `testappcloudpaths APP_ID` 및 `set_spew_level 4 4`로 경로를 진단할 수 있습니다. [Valve Cloud 사전 테스트](https://partner.steamgames.com/doc/features/cloud)
7. 스토어 페이지 체크리스트를 마치고 먼저 검토를 요청합니다. 테스트한 빌드를 기본 브랜치에 올린 뒤 빌드 체크리스트에서 검토를 요청합니다. 두 검토와 출시 요건을 충족하면 Steamworks의 출시 버튼으로 공개합니다. [Valve 출시 절차](https://partner.steamgames.com/doc/store/releasing)
