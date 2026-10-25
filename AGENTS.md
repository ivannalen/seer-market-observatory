<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Riskometer presentation in focused observatory components and reuse RISK_PROTOCOLS as its read-only source; selection must never mutate a market estimate.
- Riskometer history dates are explicit demo labels attached in a browser-safe presentation helper, not claims of live market timestamps.
- Keep handheld power and display-mode state local to the Riskometer; device buttons change presentation or select protocols, never fabricate new readings.
- Maintain typography and theme roles through shared CSS tokens and the root font stylesheet; this keeps all interfaces consistent without page-level font overrides.
- Use shared chart-point hit targets, focus rings and pointer/keyboard handlers for interactive SVG data points; charts and lists must act on the same selection state.
