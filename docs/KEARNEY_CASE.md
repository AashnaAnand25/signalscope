# Kearney PERLab case brief

This independent hackathon prototype is tailored to Kearney's public PERLab positioning. It is not an official Kearney system or a claim that Kearney supplied customer data.

## What public sources establish

| Public page | Relevant scope | How SignalScope uses it |
| --- | --- | --- |
| [PERLab overview](https://www.kearney.com/service/product-excellence-and-renewal-lab/) | Kearney describes customer and brand analysis, consumer sentiment, product value and margin work. | Position the workspace around client product evidence and trade-offs. |
| [What we do](https://www.kearney.com/web/product-excellence-and-renewal-lab/what-we-do) | PERLab presents design for growth, design for margin, portfolio/SKU analysis, and sourcing/quality trade-offs. | Separate change proposals, success metrics, and cost/quality guardrails. |
| [About PERLab](https://www.kearney.com/web/product-excellence-and-renewal-lab/about-us) | Kearney invites teams to bring their product and data into a collaborative engagement. | Require a specific client product, revision, permitted corpus, and accountable reviewer. |
| [Brand-centric design-to-value article](https://www.kearney.com/documents/291362523/313086342/Kearney-how-can-brand-centric-design-to-value-enhance-the-consumer-experience-and-fuel-profitable-growth.pdf/) | Kearney discusses feature utility, packaging, price, and cost trade-offs in consumer products. | Use as background for experiment design, never as raw reviews or a claim about an unnamed client. |

## First real engagement

The recommended first case is a **single client product family**, with its SKU/version/region recorded in `/company`. A PERLab researcher imports approved original customer passages, reviews an exact supporting span for each need, and records counterexamples from another segment. Product and commercial owners compare alternatives, write a reversal rule, and later enter outcome data from a defined test.

The public pages do **not** reveal a client catalog, raw customer passages, BOM, experiment assignments, or sales data. The app does not fabricate these. Kearney's published case studies are provider-reported examples of past work, not a permitted dataset for a new client analysis.

## Fields to request for the pilot

1. Product catalog: client permission, model/SKU, revision, region, attributes and release dates.
2. Customer evidence: export ID, original passage, source reference, event date, product mapping, consent/use terms and permitted retention.
3. Economics: BOM or service cost, price, gross margin definition, returns/claims and any quality guardrails.
4. Test data: eligible population, assignment method, variant, time window, orders or choice outcomes, and measurement owner.
5. Deployment: approved identity provider, hosting, access scope, retention and deletion requirements.

The new shared API supports the workflow manually; automated client connectors and an approved AI extraction gateway are not configured. Kearney's public site cannot authorize access to a client's private systems.
