// Function to handle the download process (reused)
function downloadModifiedFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const selectFileButton = document.getElementById('selectFileButton');
    const addedTextarea = document.getElementById('addedText');
    const previewTextarea = document.getElementById('previewText');
    const downloadModifiedButton = document.getElementById('downloadModifiedButton');
    const statusMessage = document.getElementById('statusMessage');

    let currentFileName = ''; // To store the original file name for download

    // Helper function to update the download button's disabled state
    function updateDownloadButtonState() {
        // Button is enabled if previewTextarea has content OR addedTextarea has content
        if (previewTextarea.value.length > 0 || addedTextarea.value.length > 0) {
            downloadModifiedButton.disabled = false;
        } else {
            downloadModifiedButton.disabled = true;
        }
    }

    // 1. Event listener for the "Select File & Generate Preview" button
    selectFileButton.addEventListener('click', () => {
        fileInput.click(); // Programmatically click the hidden file input
    });

    // 2. Event listener for when a file is selected in the file input
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        currentFileName = file ? file.name : ''; // Store the file name

        if (!file) {
            statusMessage.textContent = "No file selected. Please choose a .txt file.";
            previewTextarea.value = ''; // Clear preview
            updateDownloadButtonState(); // Update button state
            return;
        }

        if (!file.name.toLowerCase().endsWith('.txt')) {
            statusMessage.textContent = "Error: Please select a .txt file.";
            previewTextarea.value = ''; // Clear preview
            updateDownloadButtonState(); // Update button state
            event.target.value = ''; // Clear input for re-selection
            return;
        }

        statusMessage.textContent = `Reading "${file.name}"...`;

        const reader = new FileReader();

        reader.onload = function(e) {
            const originalContent = e.target.result;
            const customTextToAdd = addedTextarea.value; // Get text from first textarea

            // --- Modification Logic ---
            const modifiedContent = customTextToAdd + "\n\n" + originalContent;

            // Display the modified content in the preview textarea
            previewTextarea.value = modifiedContent;
            statusMessage.textContent = `Preview generated for "${file.name}". Review and download.`;

            updateDownloadButtonState(); // Enable the download button now that content is ready for review

            event.target.value = ''; // Clear input to allow re-selection of the same file
        };

        reader.onerror = function(e) {
            console.error("Error reading file:", e.target.error);
            statusMessage.textContent = "Error reading the file. Please try again.";
            previewTextarea.value = '';
            updateDownloadButtonState(); // Update button state
            event.target.value = '';
        };

        reader.readAsText(file); // Read the file as text
    });

    // New: Event listener for input in the 'addedTextarea'
    addedTextarea.addEventListener('input', updateDownloadButtonState);

    // 3. Event listener for the "Download Reviewed File" button
    downloadModifiedButton.addEventListener('click', () => {
        const contentToDownloadFromPreview = previewTextarea.value; // Content from the preview textarea
        const contentToDownloadFromAddedText = addedTextarea.value; // Content from the top input textarea

        let finalContent = '';
        let suggestedFileName = '';

        if (contentToDownloadFromPreview.length > 0) {
            // Case 1: Preview has content (means a file was processed)
            finalContent = contentToDownloadFromPreview;
            // Use original file name for suggestion, fallback if somehow not set
            suggestedFileName = currentFileName ? currentFileName.replace(/(\.txt)$/i, '_reviewed.txt') : 'new_document_from_preview.txt';
        } else if (contentToDownloadFromAddedText.length > 0) {
            // Case 2: Preview is empty, but top textarea has content (user only typed)
            finalContent = contentToDownloadFromAddedText;
            suggestedFileName = 'custom_text_document.txt'; // Generic name for new file
        } else {
            // Case 3: Both are empty, nothing to download
            alert("No content to download. Please type text or select a file first.");
            return;
        }

        downloadModifiedFile(finalContent, suggestedFileName);
        statusMessage.textContent = `"${suggestedFileName}" downloaded!`;
        
        // Optionally clear preview and disable button after download (if desired)
        // previewTextarea.value = '';
        // addedTextarea.value = ''; // You might not want to clear this if user wants to keep adding
        // updateDownloadButtonState(); // Update button state after clearing
    });

    // Initial check for download button state on page load
    updateDownloadButtonState();
});
