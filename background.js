if (window.location.hostname === "news.ycombinator.com" && !window.location.href.includes("front?day")) {
    let now = new Date();
    let localOffset = now.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    let localDate = new Date(now.getTime() - localOffset); // Convert to local time

    localDate.setDate(localDate.getDate() - 1); // Get previous day in local time
    let formattedDate = localDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    let hnUrl = `https://news.ycombinator.com/front?day=${formattedDate}`;
    
    window.location.replace(hnUrl);
}

function modifyHnPage() {
    // Remove date header
    let elements = document.querySelectorAll("div[style='margin-left:36px; margin-top:6px; margin-bottom:14px']");
    elements.forEach(el => el.remove());

    // Sort and limit posts by upvotes
    let rows = Array.from(document.querySelectorAll('.athing'));
    let postData = rows.map((row, index) => {
        let id = row.getAttribute('id');
        let voteSpan = document.querySelector(`#score_${id}`);
        let upvotes = voteSpan ? parseInt(voteSpan.innerText) : 0;
        
        // Remove vote links <td>
        let voteTd = row.querySelector("td.votelinks");
        if (voteTd) {
            voteTd.remove();
        }
        
        // Add left margin to <span class="titleline">
        let titleSpan = row.querySelector("span.titleline");
        if (titleSpan) {
            titleSpan.style.marginLeft = "5px";
        }
        
        // Set fixed width for rank <td>
        let rankTd = row.querySelector("td.title span.rank");
        if (rankTd) {
            rankTd.parentElement.style.width = "20px";
        }
        
        return { row, upvotes, index };
    });

    postData.sort((a, b) => b.upvotes - a.upvotes);
    postData = postData.slice(0, 20); // Keep top 20 posts

    let xpath = "/html/body/center/table/tbody/tr[3]/td/table/tbody";
    let result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    let targetLocation = result.singleNodeValue;
    
    if (targetLocation) {
        targetLocation.innerHTML = ''; // Clear existing content at target location
        postData.forEach((data, newIndex) => {
            // Update rank number
            let rankSpan = data.row.querySelector("span.rank");
            if (rankSpan) {
                rankSpan.textContent = `${newIndex + 1}.`;
            }
            
            // Add spacing between rows
            data.row.style.marginLeft = "10px";
            data.row.style.marginBottom = "5px";
            data.row.style.display = "block";
            
            targetLocation.appendChild(data.row);
            let nextRow = data.row.nextElementSibling;
            if (nextRow && !nextRow.classList.contains('athing')) {
                targetLocation.appendChild(nextRow); // Preserve metadata row
            }
        });
    } else {
        console.error("Target location not found using XPath");
    }
}

document.addEventListener("DOMContentLoaded", modifyHnPage);