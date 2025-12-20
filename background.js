chrome.commands.onCommand.addListener(async (command) => {
  if (command === "fill-form-hotkey") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    chrome.tabs.sendMessage(tab.id, {
      action: "FILL_FORM",
      options: {
        onlyRequired: false,
        skipFilled: true
      }
    });
  }
});
