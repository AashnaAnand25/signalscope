# Graph Report - src  (2026-11-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 625 nodes · 1780 edges · 27 communities (22 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `229904c0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23

## God Nodes (most connected - your core abstractions)
1. `cn()` - 243 edges
2. `Button` - 42 edges
3. `useDemo()` - 34 edges
4. `DesirePanel()` - 21 edges
5. `Badge()` - 18 edges
6. `EvidenceRecord` - 18 edges
7. `DialogContent` - 17 edges
8. `OpportunityDialog()` - 15 edges
9. `PageIntro()` - 14 edges
10. `DialogTitle` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `EvidenceRecord`  [EXTRACTED]
  src/components/pocket/evidence-card.tsx → src/lib/types.ts
- `MetricCard()` --calls--> `cn()`  [EXTRACTED]
  src/components/pocket/metric-card.tsx → src/lib/utils.ts
- `Props` --references--> `DesireStats`  [EXTRACTED]
  src/components/pocket/need-sticker.tsx → src/lib/metrics.ts
- `AccordionItem` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts
- `AccordionTrigger` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (27 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (60): Props, campusBackpack, evidence, seededSurveyResponses, getProduct(), PRODUCTS, SEEDED_SURVEY_RESPONSES, Ctx (+52 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (49): contextText(), DESIRE_ICON, DesirePanel(), Empty(), Section(), EvidenceCard(), Highlighted(), Props (+41 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (39): AccessibilitySettings(), Context, defaults, Prefs, MetricGuide(), terms, OpportunityDialog(), OpportunityNote() (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (43): BackpackExplorer(), CHART_HELP, ChartPanel(), colors, CoOccurrenceChart(), NeedsChart(), SourceChart(), TrendChart() (+35 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (28): Answer, ResearchAgent(), consumeLastCapturedError(), describeError(), describeStatus(), originalConsoleError, safeStringify(), renderErrorPage() (+20 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (25): AccessibilityProvider(), SyntheticNotice(), PocketPal(), Props, NAV, ProvenanceBadge(), SiteHeader(), PopoverContent (+17 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (31): Input, Separator, SidebarContent, SidebarContext, SidebarContextProps, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (18): AccordionContent, AccordionItem, AccordionTrigger, Avatar, AvatarFallback, AvatarImage, HoverCardContent, Progress (+10 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (31): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator(), Card (+23 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (12): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport, ToggleGroup (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (12): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (11): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (13): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+5 more)

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (10): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent, getPayloadConfigFromPayload() (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (9): Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.24
Nodes (9): ButtonProps, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 20 - "Community 20"
Cohesion: 0.40
Nodes (5): describeThrown(), LovableErrorOptions, LovableEvents, reportLovableError(), Window

### Community 21 - "Community 21"
Cohesion: 0.50
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 8` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 22`?**
  _High betweenness centrality (0.471) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05894736842105263 - nodes in this community are weakly interconnected._
- **Why does `Button` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 12`, `Community 13`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08743169398907104 - nodes in this community are weakly interconnected._
- **Why does `useDemo()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10213032581453634 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07616892911010557 - nodes in this community are weakly interconnected._