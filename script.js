let accounts;
let privateKey = "";
let transactions = [];

let error;
let nonce;

function errorMsg(message) {
    $("error-box").style.display = "block";
    $("errorMessage").innerHTML = message;

    error = true;
}

$("addCountdown").addEventListener("click", async () => {
    error = false;

    $("error-box").style.display = "none";
    let address = $("presaleAddress").value;
    if(!web3.utils.isAddress(address)) {
        errorMsg("Address is not a valid address!");
        return;
    }

    let amount = $("amount").value;
    amount = amount.replaceAll(",", ".");

    let sendEarlier = $("earlier").value;

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
        gasLimit: "0x3d090",
        gasPrice: await web3.eth.getGasPrice(),
        nonce: nonce,
        to: address,
        value: web3.utils.toWei(amount),
        data: ""
    };

    nonce += 1;
    
    
    let signed = await web3.eth.accounts.signTransaction(rawTx, privateKey);

    let startIn = (Date.now() / 1000) - web3.utils.hexToNumber(result);

    if(startIn > 1) {
        errorMsg("Presale not found or already active");
        return;
    } else {
        startIn *= -1;
        transactions.push(setTimeout(async () => {
            console.log(223);
            web3.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', console.log)
        }, (startIn * 1000) - sendEarlier));

        let tr = document.createElement("tr");
        let th2 = document.createElement("th");
        let th3 = document.createElement("th");
        let th4 = document.createElement("th");
        let cancelBtn = document.createElement("button");
        console.log(transactions.length-1);
        tr.id = "tr" + (transactions.length-1).toString();
        cancelBtn.innerHTML = "CANCEL";
        th2.innerHTML = amount;
        th3.innerHTML = Math.floor(startIn);
        th3.id = "time" + (transactions.length-1).toString();
        th4.appendChild(cancelBtn);

        tr.appendChild(th2);
        tr.appendChild(th3);
        tr.appendChild(th4);
        $("table").appendChild(tr);

        cancelBtn.addEventListener("click", () => {
            clearInterval(transactions.length-1);
            $("tr" + (transactions.length-1).toString()).remove();
            transactions[transactions.length-1] = undefined;
        });
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

    while(privateKey == "" || privateKey == undefined || privateKey == null || privateKey.length < 64) {
        privateKey = prompt("Private key: ");
    }

    // Get the connected account
    accounts = await web3.eth.getAccounts();

    if(accounts.length == 0) {
        console.log(1111);
        await ethereum.enable();
        accounts = await web3.eth.getAccounts();
    }

    nonce = await web3.eth.getTransactionCount(accounts[0]); 

    setInterval(() => {
        for(let i=0;i<transactions.length;i++) {
            if(transactions[i] != undefined) {
                $("time" + (i.toString())).innerHTML = parseInt($("time" + (i).toString()).innerHTML) - 1;
                if($("time" + (i).toString()).innerHTML < -5) {
                    $("tr" + (i.toString())).remove();
                    transactions[i] = undefined;
                }
            }
        }
    }, 1000);
});
