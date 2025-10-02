# Tab Limiter and Restorer v2

This is a modified version of the original ["Tab Limiter And Restorer"](https://chromewebstore.google.com/detail/Tab%20Limiter%20And%20Restorer/ifhilckbhneppbcbpkimbgeahhijhdpj) chrome extension.

This extension enables you to limit the number of tabs opened in a browser window.

It will close tabs when you reach the limit and restore them when there is a space.

## Features of v2

*   **Recover from crashes:** After a browser crash, queues are recovarable.
*   **Dark Theme Support**

## Installation

### From the Chrome Web Store (Coming Soon)

Once published, you will be able to install this extension from the Chrome Web Store.

### Manual Installation (for developers)

1.  Clone this repository: `git clone https://github.com/erenseymen/Tab-Limiter-And-Restorer-v2.git`
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" in the top right corner.
4.  Click on "Load unpacked".
5.  Select the directory where you cloned the repository.

## How to Use

1.  Click on the extension icon in your browser's toolbar.
2.  In the popup, you will see the current tab limit.
3.  You can change the tab limit by entering a new number and clicking "Set Limit".
4.  When you open a new tab that exceeds the limit, the oldest tab will be closed and added to the "Recently Closed" list in the popup.
5.  To restore a closed tab, simply click on it in the "Recently Closed" list.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or find a bug, please open an issue or submit a pull request.