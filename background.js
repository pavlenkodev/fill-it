chrome.commands.onCommand.addListener(async (command) => {
  if (command === "fill-form-hotkey") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab) return;

    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "FILL_FORM",
        options: {
          onlyRequired: true,
          skipFilled: true
        }
      });
    } catch (e) {
      console.warn("Fill-it: content script недоступен на этой вкладке:", e.message);
    }
  }
});
