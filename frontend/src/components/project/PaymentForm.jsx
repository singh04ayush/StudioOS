import { useState } from "react";
import { addPayment } from "../../services/projectService";

export default function PaymentForm({ projectId, onSuccess }) {

    const [amount, setAmount] = useState("");

    const [paymentMode, setPaymentMode] = useState("Cash");

    const [paymentDate, setPaymentDate] = useState("");

    const [remarks, setRemarks] = useState("");

    async function savePayment(e) {

        e.preventDefault();

        await addPayment({

            projectId,

            amount,

            paymentMode,

            paymentDate,

            remarks

        });

        alert("Payment Saved");

        onSuccess();

    }

    return (

        <form
            onSubmit={savePayment}
            className="bg-slate-900 rounded-2xl p-6 space-y-4"
        >

            <h2 className="text-2xl font-bold">

                Record Payment

            </h2>

            <input

                type="number"

                placeholder="Amount"

                value={amount}

                onChange={(e) => setAmount(e.target.value)}

                className="w-full bg-slate-800 p-3 rounded"

                required

            />

            <input

                type="date"

                value={paymentDate}

                onChange={(e) => setPaymentDate(e.target.value)}

                className="w-full bg-slate-800 p-3 rounded"

                required

            />

            <select

                value={paymentMode}

                onChange={(e) => setPaymentMode(e.target.value)}

                className="w-full bg-slate-800 p-3 rounded"

            >

                <option>Cash</option>

                <option>UPI</option>

                <option>Bank Transfer</option>

                <option>Cheque</option>

            </select>

            <textarea

                placeholder="Remarks"

                value={remarks}

                onChange={(e) => setRemarks(e.target.value)}

                className="w-full bg-slate-800 p-3 rounded"

            />

            <button
                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl"
            >

                Save Payment

            </button>

        </form>

    );

}