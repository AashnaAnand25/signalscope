# Graph Report - src  (2026-11-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 701 nodes · 1949 edges · 32 communities (26 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `651bfe62`
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
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29

## God Nodes (most connected - your core abstractions)
1. `cn()` - 243 edges
2. `Button` - 50 edges
3. `useDemo()` - 36 edges
4. `DesirePanel()` - 21 edges
5. `PageIntro()` - 20 edges
6. `Badge()` - 20 edges
7. `EvidenceRecord` - 19 edges
8. `DialogContent` - 17 edges
9. `EvidenceCard()` - 15 edges
10. `OpportunityDialog()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `EvidenceRecord`  [EXTRACTED]
  src/components/pocket/evidence-card.tsx → src/lib/types.ts
- `MetricCard()` --calls--> `cn()`  [EXTRACTED]
  src/components/pocket/metric-card.tsx → src/lib/utils.ts
- `AccordionItem` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts
- `AccordionTrigger` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts
- `AccordionContent` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (32 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (66): contextText(), DESIRE_ICON, DesirePanel(), Empty(), Props, Section(), EvidenceCard(), Highlighted() (+58 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (42): AccessibilityProvider(), AccessibilitySettings(), Context, defaults, Prefs, MetricGuide(), terms, OpportunityDialog() (+34 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (38): campusBackpack, evidence, seededSurveyResponses, getProduct(), PRODUCTS, SEEDED_SURVEY_RESPONSES, Ctx, DemoStoreProvider() (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (37): Avatar, AvatarFallback, AvatarImage, Card, CardContent, CardDescription, CardFooter, CardHeader (+29 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (29): Answer, PERLAB_TOOLS, VELOCITY_RESEARCH_URL, Comparison, comparisonSchema, CompetitorInput, competitorInputSchema, Extraction (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (31): Input, Separator, SidebarContent, SidebarContext, SidebarContextProps, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (22): consumeLastCapturedError(), describeError(), describeStatus(), originalConsoleError, safeStringify(), renderErrorPage(), fetch(), getServerEntry() (+14 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (26): BackpackExplorer(), DecisionStoryboard(), options, scenes, ResearchAgent(), CHART_HELP, ChartPanel(), colors (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (32): getRouter(), Route, Route, Route, Route, Route, Route, Route (+24 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (15): ButtonProps, HoverCardContent, Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLink(), PaginationLinkProps (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (16): Alert, AlertDescription, AlertTitle, alertVariants, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (12): NAV, ProvenanceBadge(), PopoverContent, SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (17): PageIntro(), apiBase(), CompanyWorkspace(), action(), load(), submit(), Decision, Evidence (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (12): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+4 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (11): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+3 more)

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (13): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+5 more)

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (10): DemoTrail(), SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (10): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent, getPayloadConfigFromPayload() (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.20
Nodes (9): Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (5): describeThrown(), LovableErrorOptions, LovableEvents, reportLovableError(), Window

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 25 - "Community 25"
Cohesion: 0.40
Nodes (3): TabsContent, TabsList, TabsTrigger

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 3` to `Community 0`, `Community 1`, `Community 5`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 26`, `Community 27`?**
  _High betweenness centrality (0.415) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06729356450191008 - nodes in this community are weakly interconnected._
- **Why does `Button` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 9`, `Community 11`, `Community 12`, `Community 15`, `Community 16`, `Community 17`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08365384615384615 - nodes in this community are weakly interconnected._
- **Why does `useDemo()` connect `Community 7` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 11`, `Community 12`, `Community 17`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07910014513788098 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.0782608695652174 - nodes in this community are weakly interconnected._