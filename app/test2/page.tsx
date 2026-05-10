"use client";
const items = [
  "Expenses",
  "Savings",
  "Budgets",
  "Habits",
  "Spending",
  "Goals",
  "Payments",
  "Growth",
];

export default function ScrollPage() {
  return (
    <main className="">

    

      <section className=" flex relative  pl-20 items-start ">
        <h1 className="sticky top-[calc(50vh-1.5lh)]  text-[clamp(2rem,8vw,6rem)] font-black uppercase   tracking-[-0.07em]">
          Track
        </h1>
        <div className="pl-10 ">
          {items.map((item, index) => (
            <h1
              key={index}
              className="snap-center text-[clamp(2rem,8vw,6rem)] font-black uppercase leading-[1.5] tracking-[-0.07em]"
            >
              {item}
            </h1>
          ))}
        </div>
      </section>

 

    </main>
  );
}