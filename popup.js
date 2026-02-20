const fillBtn = document.getElementById("fillBtn");
const onlyRequired = document.getElementById("onlyRequired");
const skipFilled = document.getElementById("skipFilled");

fillBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) return;

  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: "FILL_FORM",
      options: {
        onlyRequired: onlyRequired.checked,
        skipFilled: skipFilled.checked
      }
    });
  } catch (e) {
    console.warn("Fill-it: content script недоступен на этой вкладке:", e.message);
  }
});
