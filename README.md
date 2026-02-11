# RetirementCalculator
A very simple retirement calculator intended to think of everything (United States) you could reasonably do to financially prepare for retirement - or early retirement.

This calculator is intended to be a forever work in progress. There are two variants:

 - HTML - the most common approach. This is a zero dependencies HTML file that is expected to work in any HTML5 compliant browser. 
 - React - this is a mechanism to publish the logic on your application server. 

This retirement calculator considers the following investment vehicles:

 - **401(k)** - the solution considers maximum contribution limits as of 2026 and assumes a $500 limit increase per year, conservatively
 - **Roth IRA** - the solution considers maximum Roth IRA limits as of 2026 and assumes a $500 limit increase per year
 - **HSA** - the solution considers maximum HSA contribution limits as of 2026 and assumes a $500 limit increase per year
 - **Stocks and Bonds** - the solution allows you to allocate funds towards Stocks and Bonds
 - **Generalized Savings** - the solution allows you to allocate savings dollars. It does not treat them in any special way. 

#### The solution has individual contribution growth values to encourage incremental increases in savings. 
#### The solution captures your current balances across each vehicle and your starting or current contribution amounts.
#### The solution considers Catch-Up contributions for age-specific IRS guidelines and permits you to select your catch-up value.
#### The solution considers Employer 401(k) Contributions based on:

 - Match Percentage - how much the employer matches per contributed dollar (this varies between organizations, some will match dollar for dollar, some will match a fraction of a dollar)
 - Match Maximum - how many of your contribution % the employer will match to. This is often 6%.
 - Profit Sharing - a small amount of employers will provide scheduled employer contributions to your 401(k) based on a performance goal or outcome. This is provided as a percent of salary. For most, this will be 0%.
#### The solution allows you to select forecasted ROI for your investments per investment type.
#### The solution asks you to select an annual withdrawal amount based on your declared retirement age. This amount also has a built-in tax implication as well as early withdrawal penalty logic.
#### The solution also considers minimum distribution requirements starting at an age you enter. (For 2026 IRS guidelines, this is 73 years)

This is not a final release product. Please consult a financial professional for actual guidance. This tool is intended for modelling and entertainment purposes only and is not an investment or retirement planning tool. Please make your own decisions based on your own research.
