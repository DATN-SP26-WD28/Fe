/**
 * Utility to print a specific DOM element by its ID
 * @param {string} elementId - The ID of the element to print
 * @param {string} title - The title for the print job
 */
export const printElement = (elementId, title = 'In Phiếu') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  
  // Get all styles from the main document to ensure Tailwind/AntD styles (some) carry over
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('');
      } catch (e) {
        return '';
      }
    })
    .join('');

  doc.open();
  doc.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          ${styles}
          body { 
            background: white !important; 
            margin: 0; 
            padding: 0; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          }
          #${elementId} {
            width: 80mm; /* Standard thermal printer width */
            margin: 0 auto;
            padding: 10px;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
          /* Ensure black text for thermal printing */
          * {
            color: black !important;
            border-color: black !important;
          }
          .text-gray-400, .text-gray-500, .text-gray-600 {
            color: #333 !important; /* Slightly lighter than black but still readable */
          }
          .border-gray-200 {
            border-bottom-style: dotted !important;
            border-color: #666 !important;
          }
          /* Custom overrides to match the professional look */
          h1 {
            font-size: 24px !important;
            margin-bottom: 5px !important;
          }
          table th {
            border-top: 2px solid black !important;
            border-bottom: 2px solid black !important;
          }
        </style>
      </head>
      <body>
        <div id="${elementId}">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            // Wait slightly for any fonts or styles to stabilize
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.frameElement.parentNode.removeChild(window.frameElement);
              }, 1000);
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  doc.close();
};
