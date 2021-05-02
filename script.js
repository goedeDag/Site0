let accounts;
let privateKey = "";
let transaction;

$("addCountdown").addEventListener("click", async () => {
    try {
        let address = prompt("Presale Address: ");
        let amount = prompt("Amount: ");
        amount = amount.replaceAll(",", ".");

        let functionName = web3.eth.abi.encodeFunctionCall({
            name: 'presaleStartTime',
            type: 'function',
            inputs: []
        }, []);

        let result = await web3.eth.call({
            to: address,
            data: functionName
        });

        let rawTx = {
            from: accounts[0],
            gasPrice: "20000000000",
            gas: "260000",
            to: address,
            value: web3.utils.toWei(amount),
            data: ""
        };
        
        let signed = await web3.eth.accounts.signTransaction(rawTx, privateKey);

        let startIn = (Date.now() / 1000) - web3.utils.hexToNumber(result);
        if(startIn > 1) {
            alert("Presale not found or already active");
            location.reload();
        }
        startIn *= -1;
        transaction = setTimeout(async () => {
            web3.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', console.log)
        }, (startIn * 1000));

        let tr = document.createElement("tr");
        let th2 = document.createElement("th");
        let th3 = document.createElement("th");
        let th4 = document.createElement("th");
        let cancelBtn = document.createElement("button");

        cancelBtn.innerHTML = "CANCEL";
        th2.innerHTML = amount;
        th3.innerHTML = Math.floor(startIn);
        th3.id = "time";
        th4.appendChild(cancelBtn);

        tr.appendChild(th2);
        tr.appendChild(th3);
        tr.appendChild(th4);
        $("table").appendChild(tr);
        $("addCountdown").style.display = "none";

        cancelBtn.addEventListener("click", () => {
            clearInterval(transaction);
            location.reload();
        });

    } catch(err) {
        console.log(err);
    }
});


// Start
window.addEventListener("load", async () => {
    // If web3 is injected connect to metamask, otherwise error
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(window.ethereum);
    } else {
        console.log("Error: Web3 is not injected in browser. Try installing Metamask!");
        return;
    }

    // Get the connected account
    accounts = await web3.eth.getAccounts();

    setInterval(() => {
        try {
            $("time").innerHTML = parseInt($("time").innerHTML) - 1;
            if($("time").innerHTML < -5) {
                location.reload();
            }
        } catch(err) {

        }
    }, 1000);
});