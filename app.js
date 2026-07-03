const state = {
  files: [],
  directoryHandle: null,
  busy: false,
};

const els = {
  dropzone: document.querySelector("#dropzone"),
  fileInput: document.querySelector("#fileInput"),
  pickFiles: document.querySelector("#pickFiles"),
  pickDirectory: document.querySelector("#pickDirectory"),
  clearAll: document.querySelector("#clearAll"),
  convertAll: document.querySelector("#convertAll"),
  queue: document.querySelector("#queue"),
  queueSummary: document.querySelector("#queueSummary"),
  format: document.querySelector("#format"),
  quality: document.querySelector("#quality"),
  qualityValue: document.querySelector("#qualityValue"),
  pngCompression: document.querySelector("#pngCompression"),
  pngCompressionValue: document.querySelector("#pngCompressionValue"),
  stripExif: document.querySelector("#stripExif"),
  saveTarget: document.querySelector("#saveTarget"),
};

const textEncoder = new TextEncoder();
const pageLang = document.documentElement.lang.toLowerCase();
const locale = pageLang.startsWith("zh-hant")
  ? "zhHant"
  : pageLang.startsWith("ja")
    ? "ja"
    : pageLang.startsWith("de")
      ? "de"
      : pageLang.startsWith("fr")
        ? "fr"
        : pageLang.startsWith("es")
          ? "es"
          : pageLang.startsWith("ko")
            ? "ko"
            : pageLang.startsWith("en")
              ? "en"
              : "zh";
const messages = {
  zh: {
    waiting: "等待转换",
    metadataPending: "未处理",
    loadingTest: "正在加载测试图",
    loadTest: "加载测试 HEIC",
    testLoaded: "测试图已加入队列",
    testLoadFailed: "测试图加载失败",
    noDirectory: "未选择目录，将下载为 ZIP",
    directoryUnsupported: "当前浏览器不支持目录选择，将使用 ZIP 下载",
    savedTo: name => `保存到 ${name}`,
    directoryFailed: "目录授权失败，将使用 ZIP 下载",
    decoding: "正在解码",
    reading: "读取中",
    cleaned: "已清洗",
    preserved: "已保留",
    noExif: "未发现 EXIF",
    saved: "已保存",
    addedZip: "已加入 ZIP",
    unwritten: "未写入",
    paramsChanged: "参数已变更",
    pendingReprocess: "待重新处理",
    fileCount: count => `${count} 个文件`,
    emptyQueue: "添加文件后会显示转换状态、元数据处理和输出大小。",
    invalidSmall: "文件太小，不是有效的 HEIC/HEIF 图片。",
    invalidFormat: "文件格式不正确或不是有效的 HEIC/HEIF 图片。",
    invalidContainer: "文件不是常见 HEIC/HEIF 容器，无法转换。",
    decoderMissing: "HEIC 解码库未加载，请刷新页面后重试。",
    decoderNoData: "HEIC 解码库没有返回图片数据。",
    decodeUnsupported: "解码失败：当前浏览器解码库不支持这张 HEIC。常见原因是 HDR、10-bit、特殊 HEVC 编码或 Live Photo 辅助图层。",
    decodeNoImage: "解码失败：文件容器可读取，但没有找到可转换的主图像。",
    alreadyReadable: "文件已经是浏览器可读取图片，不需要 HEIC 转换。",
    workerBlocked: "解码失败：浏览器阻止了解码 Worker，请确认通过 http://127.0.0.1 访问而不是 file:// 打开。",
    decodeFailed: raw => `解码失败：${raw || "当前 HEIC 变体暂不支持"}`,
    genericFailed: "转换失败",
    downloadSingle: "下载单张",
  },
  ko: {
    waiting: "변환 대기",
    metadataPending: "미처리",
    loadingTest: "테스트 이미지 로드 중",
    loadTest: "테스트 HEIC 불러오기",
    testLoaded: "테스트 이미지가 목록에 추가됨",
    testLoadFailed: "테스트 이미지 로드 실패",
    noDirectory: "저장 폴더가 선택되지 않았습니다. ZIP으로 다운로드합니다",
    directoryUnsupported: "현재 브라우저는 폴더 선택을 지원하지 않습니다. ZIP으로 다운로드합니다",
    savedTo: name => `${name}에 저장`,
    directoryFailed: "폴더 권한을 받을 수 없습니다. ZIP으로 다운로드합니다",
    decoding: "디코딩 중",
    reading: "읽는 중",
    cleaned: "삭제됨",
    preserved: "보존됨",
    noExif: "EXIF 없음",
    saved: "저장됨",
    addedZip: "ZIP에 추가됨",
    unwritten: "쓰지 않음",
    paramsChanged: "설정이 변경됨",
    pendingReprocess: "다시 변환 필요",
    fileCount: count => `${count}개 파일`,
    emptyQueue: "파일을 추가하면 변환 상태, 메타데이터 처리 결과, 출력 크기가 표시됩니다.",
    invalidSmall: "파일이 너무 작아 유효한 HEIC/HEIF 이미지가 아닙니다.",
    invalidFormat: "파일 형식이 올바르지 않거나 유효한 HEIC/HEIF 이미지가 아닙니다.",
    invalidContainer: "일반적인 HEIC/HEIF 컨테이너가 아니어서 변환할 수 없습니다.",
    decoderMissing: "HEIC 디코더가 로드되지 않았습니다. 페이지를 새로고침한 뒤 다시 시도하세요.",
    decoderNoData: "HEIC 디코더가 이미지 데이터를 반환하지 않았습니다.",
    decodeUnsupported: "디코딩 실패: 현재 브라우저 디코더가 이 HEIC 파일을 지원하지 않습니다. HDR, 10-bit, 특수 HEVC 인코딩 또는 Live Photo 보조 이미지가 원인일 수 있습니다.",
    decodeNoImage: "디코딩 실패: 파일 컨테이너는 읽을 수 있지만 변환 가능한 기본 이미지를 찾지 못했습니다.",
    alreadyReadable: "이미 브라우저에서 읽을 수 있는 이미지라 HEIC 변환이 필요하지 않습니다.",
    workerBlocked: "디코딩 실패: 브라우저가 디코딩 Worker를 차단했습니다. file:// 대신 http://127.0.0.1 주소로 열어 주세요.",
    decodeFailed: raw => `디코딩 실패: ${raw || "현재 HEIC 형식을 지원하지 않습니다"}`,
    genericFailed: "변환 실패",
    downloadSingle: "개별 다운로드",
  },
};

Object.assign(messages, {
  en: {
    waiting: "Waiting",
    metadataPending: "Not processed",
    loadingTest: "Loading test images",
    loadTest: "Load test HEIC",
    testLoaded: "Test images added",
    testLoadFailed: "Failed to load test images",
    noDirectory: "No folder selected. A ZIP will be downloaded",
    directoryUnsupported: "This browser does not support folder selection. A ZIP will be downloaded",
    savedTo: name => `Saving to ${name}`,
    directoryFailed: "Folder permission failed. A ZIP will be downloaded",
    decoding: "Decoding",
    reading: "Reading",
    cleaned: "Cleaned",
    preserved: "Preserved",
    noExif: "No EXIF found",
    saved: "Saved",
    addedZip: "Added to ZIP",
    unwritten: "Not written",
    paramsChanged: "Settings changed",
    pendingReprocess: "Needs reconversion",
    fileCount: count => `${count} file${count === 1 ? "" : "s"}`,
    emptyQueue: "Added files will show conversion status, metadata handling, and output size.",
    invalidSmall: "The file is too small to be a valid HEIC/HEIF image.",
    invalidFormat: "The file is not a valid HEIC/HEIF image.",
    invalidContainer: "This is not a common HEIC/HEIF container and cannot be converted.",
    decoderMissing: "The HEIC decoder is not loaded. Refresh the page and try again.",
    decoderNoData: "The HEIC decoder did not return image data.",
    decodeUnsupported: "Decode failed: this HEIC variant is not supported by the current browser decoder.",
    decodeNoImage: "Decode failed: the container is readable, but no convertible primary image was found.",
    alreadyReadable: "This image is already readable by the browser and does not need HEIC conversion.",
    workerBlocked: "Decode failed: the browser blocked the decoding worker. Open the page via http://127.0.0.1, not file://.",
    decodeFailed: raw => `Decode failed: ${raw || "this HEIC variant is not supported"}`,
    genericFailed: "Conversion failed",
    downloadSingle: "Download image",
  },
  ja: {
    waiting: "変換待ち",
    metadataPending: "未処理",
    loadingTest: "テスト画像を読み込み中",
    loadTest: "テスト HEIC を読み込む",
    testLoaded: "テスト画像を追加しました",
    testLoadFailed: "テスト画像の読み込みに失敗しました",
    noDirectory: "保存先フォルダ未選択。ZIP としてダウンロードします",
    directoryUnsupported: "このブラウザはフォルダ選択に対応していません。ZIP としてダウンロードします",
    savedTo: name => `${name} に保存`,
    directoryFailed: "フォルダ権限を取得できません。ZIP としてダウンロードします",
    decoding: "デコード中",
    reading: "読み込み中",
    cleaned: "削除済み",
    preserved: "保持済み",
    noExif: "EXIF なし",
    saved: "保存済み",
    addedZip: "ZIP に追加済み",
    unwritten: "未書き込み",
    paramsChanged: "設定が変更されました",
    pendingReprocess: "再変換が必要",
    fileCount: count => `${count} ファイル`,
    emptyQueue: "ファイルを追加すると、変換状況、メタデータ処理、出力サイズが表示されます。",
    invalidSmall: "有効な HEIC/HEIF 画像としてはファイルが小さすぎます。",
    invalidFormat: "有効な HEIC/HEIF 画像ではありません。",
    invalidContainer: "一般的な HEIC/HEIF コンテナではないため変換できません。",
    decoderMissing: "HEIC デコーダーが読み込まれていません。ページを更新して再試行してください。",
    decoderNoData: "HEIC デコーダーが画像データを返しませんでした。",
    decodeUnsupported: "デコード失敗: 現在のブラウザデコーダーはこの HEIC 形式に対応していません。",
    decodeNoImage: "デコード失敗: コンテナは読めますが、変換可能なメイン画像が見つかりません。",
    alreadyReadable: "この画像はブラウザで既に読み取れるため HEIC 変換は不要です。",
    workerBlocked: "デコード失敗: ブラウザが Worker をブロックしました。file:// ではなく http://127.0.0.1 で開いてください。",
    decodeFailed: raw => `デコード失敗: ${raw || "この HEIC 形式は未対応です"}`,
    genericFailed: "変換失敗",
    downloadSingle: "画像をダウンロード",
  },
  de: {
    waiting: "Wartet",
    metadataPending: "Nicht verarbeitet",
    loadingTest: "Testbilder werden geladen",
    loadTest: "Test-HEIC laden",
    testLoaded: "Testbilder hinzugefügt",
    testLoadFailed: "Testbilder konnten nicht geladen werden",
    noDirectory: "Kein Ordner ausgewählt. Download als ZIP",
    directoryUnsupported: "Dieser Browser unterstützt keine Ordnerauswahl. Download als ZIP",
    savedTo: name => `Speichern in ${name}`,
    directoryFailed: "Ordnerberechtigung fehlgeschlagen. Download als ZIP",
    decoding: "Wird dekodiert",
    reading: "Wird gelesen",
    cleaned: "Bereinigt",
    preserved: "Beibehalten",
    noExif: "Kein EXIF gefunden",
    saved: "Gespeichert",
    addedZip: "Zur ZIP hinzugefügt",
    unwritten: "Nicht geschrieben",
    paramsChanged: "Einstellungen geändert",
    pendingReprocess: "Neu konvertieren",
    fileCount: count => `${count} Datei${count === 1 ? "" : "en"}`,
    emptyQueue: "Hinzugefügte Dateien zeigen Status, Metadatenverarbeitung und Ausgabegröße.",
    invalidSmall: "Die Datei ist zu klein für ein gültiges HEIC/HEIF-Bild.",
    invalidFormat: "Die Datei ist kein gültiges HEIC/HEIF-Bild.",
    invalidContainer: "Kein üblicher HEIC/HEIF-Container, Konvertierung nicht möglich.",
    decoderMissing: "Der HEIC-Decoder wurde nicht geladen. Bitte Seite aktualisieren.",
    decoderNoData: "Der HEIC-Decoder hat keine Bilddaten zurückgegeben.",
    decodeUnsupported: "Dekodierung fehlgeschlagen: Diese HEIC-Variante wird nicht unterstützt.",
    decodeNoImage: "Dekodierung fehlgeschlagen: Kein konvertierbares Hauptbild gefunden.",
    alreadyReadable: "Dieses Bild ist bereits im Browser lesbar.",
    workerBlocked: "Dekodierung fehlgeschlagen: Der Browser hat den Worker blockiert. Bitte über http://127.0.0.1 öffnen.",
    decodeFailed: raw => `Dekodierung fehlgeschlagen: ${raw || "HEIC-Variante nicht unterstützt"}`,
    genericFailed: "Konvertierung fehlgeschlagen",
    downloadSingle: "Bild herunterladen",
  },
  fr: {
    waiting: "En attente",
    metadataPending: "Non traité",
    loadingTest: "Chargement des images de test",
    loadTest: "Charger le test HEIC",
    testLoaded: "Images de test ajoutées",
    testLoadFailed: "Échec du chargement des images de test",
    noDirectory: "Aucun dossier choisi. Téléchargement en ZIP",
    directoryUnsupported: "Ce navigateur ne prend pas en charge le choix de dossier. Téléchargement en ZIP",
    savedTo: name => `Enregistrement dans ${name}`,
    directoryFailed: "Autorisation du dossier refusée. Téléchargement en ZIP",
    decoding: "Décodage",
    reading: "Lecture",
    cleaned: "Nettoyé",
    preserved: "Conservé",
    noExif: "Aucun EXIF",
    saved: "Enregistré",
    addedZip: "Ajouté au ZIP",
    unwritten: "Non écrit",
    paramsChanged: "Paramètres modifiés",
    pendingReprocess: "Reconversion requise",
    fileCount: count => `${count} fichier${count === 1 ? "" : "s"}`,
    emptyQueue: "Les fichiers ajoutés afficheront l’état, les métadonnées et la taille de sortie.",
    invalidSmall: "Le fichier est trop petit pour être une image HEIC/HEIF valide.",
    invalidFormat: "Le fichier n’est pas une image HEIC/HEIF valide.",
    invalidContainer: "Ce n’est pas un conteneur HEIC/HEIF courant.",
    decoderMissing: "Le décodeur HEIC n’est pas chargé. Actualisez la page.",
    decoderNoData: "Le décodeur HEIC n’a retourné aucune donnée image.",
    decodeUnsupported: "Échec du décodage : cette variante HEIC n’est pas prise en charge.",
    decodeNoImage: "Échec du décodage : aucune image principale convertible trouvée.",
    alreadyReadable: "Cette image est déjà lisible par le navigateur.",
    workerBlocked: "Échec du décodage : le navigateur a bloqué le worker. Ouvrez via http://127.0.0.1.",
    decodeFailed: raw => `Échec du décodage : ${raw || "variante HEIC non prise en charge"}`,
    genericFailed: "Échec de la conversion",
    downloadSingle: "Télécharger l’image",
  },
  es: {
    waiting: "En espera",
    metadataPending: "Sin procesar",
    loadingTest: "Cargando imágenes de prueba",
    loadTest: "Cargar HEIC de prueba",
    testLoaded: "Imágenes de prueba añadidas",
    testLoadFailed: "No se pudieron cargar las imágenes de prueba",
    noDirectory: "No se eligió carpeta. Se descargará un ZIP",
    directoryUnsupported: "Este navegador no permite elegir carpeta. Se descargará un ZIP",
    savedTo: name => `Guardando en ${name}`,
    directoryFailed: "No se obtuvo permiso de carpeta. Se descargará un ZIP",
    decoding: "Decodificando",
    reading: "Leyendo",
    cleaned: "Limpiado",
    preserved: "Conservado",
    noExif: "Sin EXIF",
    saved: "Guardado",
    addedZip: "Añadido al ZIP",
    unwritten: "No escrito",
    paramsChanged: "Ajustes modificados",
    pendingReprocess: "Reconvertir",
    fileCount: count => `${count} archivo${count === 1 ? "" : "s"}`,
    emptyQueue: "Los archivos añadidos mostrarán estado, metadatos y tamaño de salida.",
    invalidSmall: "El archivo es demasiado pequeño para ser una imagen HEIC/HEIF válida.",
    invalidFormat: "El archivo no es una imagen HEIC/HEIF válida.",
    invalidContainer: "No es un contenedor HEIC/HEIF común.",
    decoderMissing: "El decodificador HEIC no está cargado. Actualiza la página.",
    decoderNoData: "El decodificador HEIC no devolvió datos de imagen.",
    decodeUnsupported: "Error de decodificación: esta variante HEIC no es compatible.",
    decodeNoImage: "Error de decodificación: no se encontró una imagen principal convertible.",
    alreadyReadable: "Esta imagen ya es legible por el navegador.",
    workerBlocked: "Error de decodificación: el navegador bloqueó el worker. Abre mediante http://127.0.0.1.",
    decodeFailed: raw => `Error de decodificación: ${raw || "variante HEIC no compatible"}`,
    genericFailed: "Conversión fallida",
    downloadSingle: "Descargar imagen",
  },
  zhHant: {
    waiting: "等待轉換",
    metadataPending: "未處理",
    loadingTest: "正在載入測試圖",
    loadTest: "載入測試 HEIC",
    testLoaded: "測試圖已加入佇列",
    testLoadFailed: "測試圖載入失敗",
    noDirectory: "未選擇資料夾，將下載為 ZIP",
    directoryUnsupported: "目前瀏覽器不支援資料夾選擇，將使用 ZIP 下載",
    savedTo: name => `儲存到 ${name}`,
    directoryFailed: "資料夾授權失敗，將使用 ZIP 下載",
    decoding: "正在解碼",
    reading: "讀取中",
    cleaned: "已清除",
    preserved: "已保留",
    noExif: "未找到 EXIF",
    saved: "已儲存",
    addedZip: "已加入 ZIP",
    unwritten: "未寫入",
    paramsChanged: "參數已變更",
    pendingReprocess: "待重新處理",
    fileCount: count => `${count} 個檔案`,
    emptyQueue: "加入檔案後會顯示轉換狀態、元資料處理和輸出大小。",
    invalidSmall: "檔案太小，不是有效的 HEIC/HEIF 圖片。",
    invalidFormat: "檔案格式不正確，或不是有效的 HEIC/HEIF 圖片。",
    invalidContainer: "檔案不是常見 HEIC/HEIF 容器，無法轉換。",
    decoderMissing: "HEIC 解碼器未載入，請重新整理後再試。",
    decoderNoData: "HEIC 解碼器沒有回傳圖片資料。",
    decodeUnsupported: "解碼失敗：目前瀏覽器解碼器不支援這張 HEIC。",
    decodeNoImage: "解碼失敗：容器可讀取，但找不到可轉換的主圖片。",
    alreadyReadable: "這張圖片已可由瀏覽器讀取，不需要 HEIC 轉換。",
    workerBlocked: "解碼失敗：瀏覽器阻擋了解碼 Worker，請使用 http://127.0.0.1 開啟。",
    decodeFailed: raw => `解碼失敗：${raw || "目前 HEIC 變體不支援"}`,
    genericFailed: "轉換失敗",
    downloadSingle: "下載單張",
  },
});

function t(key, ...args) {
  const value = messages[locale][key] || messages.zh[key] || key;
  return typeof value === "function" ? value(...args) : value;
}

init();

function init() {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  els.pickFiles.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", event => {
    addFiles([...event.target.files]);
    event.target.value = "";
  });

  ["dragenter", "dragover"].forEach(type => {
    els.dropzone.addEventListener(type, event => {
      event.preventDefault();
      els.dropzone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach(type => {
    els.dropzone.addEventListener(type, event => {
      event.preventDefault();
      els.dropzone.classList.remove("is-dragging");
    });
  });

  els.dropzone.addEventListener("drop", event => {
    addFiles([...event.dataTransfer.files]);
  });

  els.pickDirectory.addEventListener("click", chooseDirectory);
  els.clearAll.addEventListener("click", clearQueue);
  els.convertAll.addEventListener("click", convertAll);

  els.quality.addEventListener("input", () => {
    els.qualityValue.value = `${Math.round(Number(els.quality.value) * 100)}%`;
    invalidateConvertedOutputs();
  });

  els.pngCompression.addEventListener("input", () => {
    els.pngCompressionValue.value = els.pngCompression.value;
  });

  els.stripExif.addEventListener("change", invalidateConvertedOutputs);
  els.format.addEventListener("change", () => {
    updateFormatControls();
    invalidateConvertedOutputs();
  });
  updateFormatControls();
  initTestFiles();
  renderQueue();
}

function addFiles(files) {
  const accepted = files.filter(file => /\.(heic|heif)$/i.test(file.name) || /image\/hei[cf]/i.test(file.type));
  const next = accepted.map(file => ({
    id: crypto.randomUUID(),
    file,
    status: "ready",
    message: t("waiting"),
    outputName: "",
    outputSize: 0,
    outputUrl: "",
    outputBlob: null,
    conversionKey: "",
    metadataStatus: t("metadataPending"),
  }));

  state.files.push(...next);
  renderQueue();
}

async function initTestFiles() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("test")) return;

  const button = document.createElement("button");
  button.className = "primary-button test-button";
  button.type = "button";
  button.textContent = t("loadTest");
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = t("loadingTest");
    try {
      const files = await Promise.all([
        fetchTestFile("./test/IMG_3167.HEIC"),
        fetchTestFile("./test/IMG_3432.HEIC"),
      ]);
      addFiles(files);
      button.textContent = t("testLoaded");
    } catch (error) {
      button.textContent = error?.message || t("testLoadFailed");
    } finally {
      button.disabled = false;
    }
  });
  els.dropzone.append(button);
  refreshIcons();
}

async function fetchTestFile(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`无法加载 ${path}`);
  }
  const blob = await response.blob();
  const name = path.split("/").pop();
  return new File([blob], name, {
    type: "image/heic",
    lastModified: Date.now(),
  });
}

async function chooseDirectory() {
  if (!window.showDirectoryPicker) {
    updateSaveTarget(null, t("directoryUnsupported"));
    return;
  }

  try {
    state.directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    updateSaveTarget(state.directoryHandle.name, t("savedTo", state.directoryHandle.name));
  } catch (error) {
    if (error.name !== "AbortError") {
      updateSaveTarget(null, t("directoryFailed"));
    }
  }
}

function updateSaveTarget(directoryName, label) {
  els.saveTarget.classList.toggle("has-directory", Boolean(directoryName));
  els.saveTarget.querySelector("span").textContent = label || t("noDirectory");
}

function clearQueue() {
  state.files.forEach(item => {
    if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
  });
  state.files = [];
  renderQueue();
}

async function convertAll() {
  if (state.busy || state.files.length === 0) return;
  state.busy = true;
  els.convertAll.disabled = true;

  const fallbackZip = !state.directoryHandle ? new JSZip() : null;
  const conversionKey = getConversionKey();

  for (const item of state.files) {
    if (item.status === "done" && item.conversionKey === conversionKey && item.outputBlob) {
      addExistingOutputToZip(item, fallbackZip);
      continue;
    }
    await convertItem(item, fallbackZip, conversionKey);
    renderQueue();
  }

  if (fallbackZip) {
    const done = state.files.filter(item => item.status === "done" && item.outputBlob);
    if (done.length > 0) {
      const blob = await fallbackZip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: Number(els.pngCompression.value) },
      });
      downloadBlob(blob, `heic-converted-${timestampName()}.zip`);
    }
  }

  state.busy = false;
  renderQueue();
}

async function convertItem(item, zip, conversionKey = getConversionKey()) {
  clearItemOutput(item);
  item.status = "running";
  item.message = t("decoding");
  item.metadataStatus = t("reading");
  renderQueue();

  try {
    const sourceBuffer = await item.file.arrayBuffer();
    assertLikelyHeif(sourceBuffer);
    const sourceExif = els.stripExif.checked ? null : extractHeifExif(sourceBuffer);
    const decoded = await decodeHeicToCanvas(item.file, sourceBuffer);
    const outputBlob = await encodeOutput(decoded.canvas, item, sourceExif);
    const outputName = outputFileName(item.file.name, els.format.value);

    item.outputName = outputName;
    item.outputSize = outputBlob.size;
    item.outputBlob = outputBlob;
    item.conversionKey = conversionKey;
    item.metadataStatus = els.stripExif.checked ? t("cleaned") : sourceExif ? t("preserved") : t("noExif");

    if (state.directoryHandle) {
      await saveBlobToDirectory(outputName, outputBlob);
      item.message = t("saved");
    } else {
      addExistingOutputToZip(item, zip);
      item.outputUrl = URL.createObjectURL(outputBlob);
      item.message = t("addedZip");
    }

    item.status = "done";
  } catch (error) {
    item.status = "error";
    item.message = friendlyError(error);
    item.outputBlob = null;
    item.conversionKey = "";
    item.metadataStatus = t("unwritten");
  }
}

function getConversionKey() {
  const format = els.format.value;
  const parts = [`format:${format}`, `stripExif:${els.stripExif.checked}`];
  if (format !== "png") {
    parts.push(`quality:${Number(els.quality.value).toFixed(2)}`);
  }
  return parts.join("|");
}

function invalidateConvertedOutputs() {
  if (state.busy) return;
  const currentKey = getConversionKey();
  let changed = false;

  state.files.forEach(item => {
    if (item.status !== "done" || item.conversionKey === currentKey) return;
    clearItemOutput(item);
    item.status = "ready";
    item.message = t("paramsChanged");
    item.outputName = "";
    item.outputSize = 0;
    item.metadataStatus = t("pendingReprocess");
    changed = true;
  });

  if (changed) renderQueue();
}

function clearItemOutput(item) {
  if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
  item.outputUrl = "";
  item.outputBlob = null;
}

function addExistingOutputToZip(item, zip) {
  if (!zip || !item.outputBlob || !item.outputName) return;
  zip.file(item.outputName, item.outputBlob);
}

async function encodeOutput(imageBlob, item, sourceExif) {
  const format = els.format.value;
  const canvas = imageBlob instanceof HTMLCanvasElement ? imageBlob : await blobToCanvas(imageBlob, format === "png");

  if (format === "png") {
    const pngBlob = await canvasToBlob(canvas, "image/png", 1);
    return els.stripExif.checked ? pngBlob : addPngTextMetadata(pngBlob, item.file, sourceExif);
  }

  const quality = Number(els.quality.value);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (els.stripExif.checked || !sourceExif || !window.piexif) {
    return dataUrlToBlob(dataUrl);
  }

  try {
    const inserted = window.piexif.insert(sourceExif, dataUrl);
    return dataUrlToBlob(inserted);
  } catch {
    return dataUrlToBlob(dataUrl);
  }
}

async function decodeHeicToCanvas(file, sourceBuffer) {
  const native = await tryNativeDecode(file);
  if (native) {
    return { canvas: native, decoder: "native" };
  }

  const heicToCanvas = await tryHeicToDecode(file, sourceBuffer);
  if (heicToCanvas) {
    return { canvas: heicToCanvas, decoder: "heic-to" };
  }

  const decoder = getHeic2Any();
  if (!decoder) {
    throw new Error(t("decoderMissing"));
  }

  const typedBlob = new Blob([sourceBuffer], { type: file.type || "image/heic" });
  try {
    const converted = await decoder({
      blob: typedBlob,
      toType: "image/png",
      quality: 1,
      multiple: true,
    });
    const imageBlob = Array.isArray(converted) ? converted[0] : converted;
    if (!(imageBlob instanceof Blob)) {
      throw new Error(t("decoderNoData"));
    }
    return { canvas: await blobToCanvas(imageBlob, true), decoder: "heic2any" };
  } catch (error) {
    throw new Error(explainDecodeError(error));
  }
}

async function tryHeicToDecode(file, sourceBuffer) {
  const heicTo = window.HeicTo;
  if (!heicTo) return null;

  const typedBlob = new Blob([sourceBuffer], { type: file.type || "image/heic" });
  try {
    const result = await heicTo({
      blob: typedBlob,
      type: "image/png",
      quality: 1,
    });
    if (result instanceof Blob) {
      return blobToCanvas(result, true);
    }
    if (result instanceof ImageBitmap) {
      const canvas = document.createElement("canvas");
      canvas.width = result.width;
      canvas.height = result.height;
      const ctx = canvas.getContext("2d", { alpha: true });
      ctx.drawImage(result, 0, 0);
      result.close();
      return canvas;
    }
  } catch (error) {
    console.warn("heic-to decode failed, falling back to heic2any", error);
  }
  return null;
}

async function tryNativeDecode(file) {
  if (!window.createImageBitmap) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { alpha: true });
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return canvas;
  } catch {
    return null;
  }
}

async function blobToCanvas(blob, alpha) {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { alpha });
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

function getHeic2Any() {
  return window.heic2any || window.heic2Any || window.Heic2any || null;
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas export failed"));
    }, mime, quality);
  });
}

async function saveBlobToDirectory(name, blob) {
  const handle = await state.directoryHandle.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

function outputFileName(name, format) {
  const clean = name.replace(/\.(heic|heif)$/i, "");
  return `${clean || "converted"}.${format}`;
}

function dataUrlToBlob(dataUrl) {
  const [header, payload] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "application/octet-stream";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function downloadBlob(blob, name) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 30_000);
}

function updateFormatControls() {
  const jpeg = els.format.value !== "png";
  els.quality.disabled = !jpeg;
  els.pngCompression.disabled = jpeg;
}

function renderQueue() {
  els.queueSummary.textContent = t("fileCount", state.files.length);
  els.convertAll.disabled = state.busy || state.files.length === 0;

  if (state.files.length === 0) {
    els.queue.innerHTML = `
      <div class="empty-state">
        <i data-lucide="files"></i>
        <p>${escapeHtml(t("emptyQueue"))}</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  els.queue.innerHTML = state.files
    .map(item => {
      const download = item.outputUrl
        ? `<a class="download-link is-visible" href="${item.outputUrl}" download="${escapeHtml(item.outputName)}" title="${escapeHtml(t("downloadSingle"))}" aria-label="${escapeHtml(t("downloadSingle"))}"><i data-lucide="download"></i></a>`
        : `<span class="download-link" aria-hidden="true"></span>`;

      return `
        <article class="file-row">
          <div class="file-icon"><i data-lucide="file-image"></i></div>
          <div class="file-main">
            <div class="file-name" title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</div>
            <div class="file-meta">
              <span>${formatBytes(item.file.size)}</span>
              <span class="status ${item.status}">${escapeHtml(item.message)}</span>
              <span>${escapeHtml(item.metadataStatus)}</span>
              ${item.outputSize ? `<span>${formatBytes(item.outputSize)}</span>` : ""}
            </div>
          </div>
          <div class="row-actions">${download}</div>
        </article>
      `;
    })
    .join("");

  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function timestampName() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function friendlyError(error) {
  const message = error?.message || String(error || "");
  if (/unsupported|format not supported|valid images|libheif|decode|HEIC/i.test(message)) {
    return message;
  }
  if (/input|format/i.test(message)) return t("invalidFormat");
  return message || t("genericFailed");
}

function explainDecodeError(error) {
  const raw = error?.message || error?.error?.message || String(error || "");
  if (/format not supported/i.test(raw)) {
    return t("decodeUnsupported");
  }
  if (/valid images/i.test(raw)) {
    return t("decodeNoImage");
  }
  if (/already browser readable/i.test(raw)) {
    return t("alreadyReadable");
  }
  if (/worker|blob|security|permission/i.test(raw)) {
    return t("workerBlocked");
  }
  return t("decodeFailed", raw);
}

function assertLikelyHeif(buffer) {
  if (buffer.byteLength < 12) {
    throw new Error(t("invalidSmall"));
  }

  const view = new DataView(buffer);
  const type = fourcc(view, 4);
  if (type !== "ftyp") {
    throw new Error(t("invalidFormat"));
  }

  const brands = new Set();
  const end = Math.min(buffer.byteLength, view.getUint32(0));
  for (let offset = 8; offset + 4 <= end; offset += 4) {
    brands.add(fourcc(view, offset));
  }

  const heifBrands = ["heic", "heix", "hevc", "hevx", "mif1", "msf1", "heim", "heis", "avif", "avis"];
  if (!heifBrands.some(brand => brands.has(brand))) {
    throw new Error(t("invalidContainer"));
  }
}

function extractHeifExif(buffer) {
  try {
    const view = new DataView(buffer);
    const boxes = readBoxes(view, 0, buffer.byteLength);
    const meta = findBox(view, boxes, "meta");
    if (!meta) return null;

    const metaChildren = readBoxes(view, meta.start + 12, meta.end);
    const iinf = findBox(view, metaChildren, "iinf");
    const iloc = findBox(view, metaChildren, "iloc");
    if (!iinf || !iloc) return null;

    const exifItemId = parseIinfForExif(view, iinf);
    if (exifItemId == null) return null;

    const extent = parseIlocForItem(view, iloc, exifItemId);
    if (!extent || extent.length <= 0) return null;

    let exifBytes = new Uint8Array(buffer, extent.offset, extent.length);
    if (exifBytes.byteLength > 4) {
      const tiffOffset = new DataView(exifBytes.buffer, exifBytes.byteOffset, 4).getUint32(0);
      if (tiffOffset > 0 && tiffOffset < exifBytes.byteLength) {
        exifBytes = exifBytes.slice(tiffOffset);
      }
    }

    const prefix = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
    const combined = new Uint8Array(prefix.length + exifBytes.length);
    combined.set(prefix, 0);
    combined.set(exifBytes, prefix.length);
    return bytesToBinaryString(combined);
  } catch {
    return null;
  }
}

function bytesToBinaryString(bytes) {
  let binary = "";
  const chunkSize = 8192;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return binary;
}

function readBoxes(view, start, end) {
  const boxes = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = view.getUint32(offset);
    const type = fourcc(view, offset + 4);
    let header = 8;
    if (size === 1 && offset + 16 <= end) {
      size = Number(view.getBigUint64(offset + 8));
      header = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < header || offset + size > end) break;
    boxes.push({ type, start: offset, end: offset + size, header });
    offset += size;
  }
  return boxes;
}

function findBox(view, boxes, type) {
  for (const box of boxes) {
    if (box.type === type) return box;
    if (["moov", "trak", "mdia", "minf", "dinf", "stbl", "meta"].includes(box.type)) {
      const childStart = box.type === "meta" ? box.start + box.header + 4 : box.start + box.header;
      const nested = findBox(view, readBoxes(view, childStart, box.end), type);
      if (nested) return nested;
    }
  }
  return null;
}

function parseIinfForExif(view, box) {
  let offset = box.start + box.header;
  const version = view.getUint8(offset);
  offset += 4;
  const entryCount = version === 0 ? view.getUint16(offset) : view.getUint32(offset);
  offset += version === 0 ? 2 : 4;

  for (let i = 0; i < entryCount && offset + 8 <= box.end; i += 1) {
    const size = view.getUint32(offset);
    const type = fourcc(view, offset + 4);
    if (size < 8 || offset + size > box.end) break;
    if (type === "infe") {
      const item = parseInfe(view, offset, offset + size);
      if (item?.itemType === "Exif") return item.itemId;
    }
    offset += size;
  }
  return null;
}

function parseInfe(view, start, end) {
  const version = view.getUint8(start + 8);
  let offset = start + 12;
  let itemId;
  let itemType = "";

  if (version >= 2) {
    itemId = version === 2 ? view.getUint16(offset) : view.getUint32(offset);
    offset += version === 2 ? 2 : 4;
    offset += 2;
    itemType = fourcc(view, offset);
  } else {
    itemId = view.getUint16(offset);
  }

  if (offset > end) return null;
  return { itemId, itemType };
}

function parseIlocForItem(view, box, wantedId) {
  let offset = box.start + box.header;
  const version = view.getUint8(offset);
  offset += 4;

  const sizeByte = view.getUint8(offset);
  const offsetSize = sizeByte >> 4;
  const lengthSize = sizeByte & 0x0f;
  const baseOffsetByte = view.getUint8(offset + 1);
  const baseOffsetSize = baseOffsetByte >> 4;
  const indexSize = version === 1 || version === 2 ? baseOffsetByte & 0x0f : 0;
  offset += 2;

  const itemCount = version < 2 ? view.getUint16(offset) : view.getUint32(offset);
  offset += version < 2 ? 2 : 4;

  for (let i = 0; i < itemCount; i += 1) {
    const itemId = version < 2 ? view.getUint16(offset) : view.getUint32(offset);
    offset += version < 2 ? 2 : 4;

    if (version === 1 || version === 2) {
      offset += 2;
    }

    const dataReferenceIndex = view.getUint16(offset);
    offset += 2;
    const baseOffset = readSized(view, offset, baseOffsetSize);
    offset += baseOffsetSize;
    const extentCount = view.getUint16(offset);
    offset += 2;

    for (let j = 0; j < extentCount; j += 1) {
      if (indexSize) offset += indexSize;
      const extentOffset = readSized(view, offset, offsetSize);
      offset += offsetSize;
      const extentLength = readSized(view, offset, lengthSize);
      offset += lengthSize;

      if (itemId === wantedId && dataReferenceIndex === 0) {
        return { offset: Number(baseOffset + extentOffset), length: Number(extentLength) };
      }
    }
  }

  return null;
}

function readSized(view, offset, size) {
  if (size === 0) return 0n;
  let value = 0n;
  for (let i = 0; i < size; i += 1) {
    value = (value << 8n) + BigInt(view.getUint8(offset + i));
  }
  return value;
}

function fourcc(view, offset) {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

async function addPngTextMetadata(blob, sourceFile, sourceExif) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunks = [
    pngTextChunk("SourceFileName", sourceFile.name),
    pngTextChunk("SourceLastModified", new Date(sourceFile.lastModified).toISOString()),
    pngTextChunk("Software", "HEIC Converter"),
  ];

  if (sourceExif) {
    chunks.push(pngTextChunk("RawEXIF", btoa(sourceExif)));
  }

  const iend = findPngIend(bytes);
  if (iend < 0) return blob;

  const output = new Uint8Array(bytes.length + chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  output.set(bytes.slice(0, iend), 0);
  let cursor = iend;
  for (const chunk of chunks) {
    output.set(chunk, cursor);
    cursor += chunk.length;
  }
  output.set(bytes.slice(iend), cursor);
  return new Blob([output], { type: "image/png" });
}

function pngTextChunk(keyword, value) {
  const type = textEncoder.encode("tEXt");
  const data = textEncoder.encode(`${keyword}\0${value}`);
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  chunk.set(type, 4);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk.slice(4, 8 + data.length)));
  return chunk;
}

function findPngIend(bytes) {
  for (let i = 8; i + 12 <= bytes.length; ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + i, 8);
    const length = view.getUint32(0);
    const type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);
    if (type === "IEND") return i;
    i += 12 + length;
  }
  return -1;
}

function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

window.__heicConverterDebug = {
  decodeHeicToCanvas,
  tryHeicToDecode,
  getHeic2Any,
  assertLikelyHeif,
};
