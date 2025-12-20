const fillBtn = document.getElementById("fillBtn");
const onlyRequired = document.getElementById("onlyRequired");
const skipFilled = document.getElementById("skipFilled");

fillBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: "FILL_FORM",
    options: {
      onlyRequired: onlyRequired.checked,
      skipFilled: skipFilled.checked
    }
  });
});
