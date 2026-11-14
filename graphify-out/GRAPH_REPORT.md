# Graph Report - src  (2026-11-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 634 nodes · 1818 edges · 32 communities (28 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `45b21580`
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 243 edges
2. `Button` - 44 edges
3. `useDemo()` - 36 edges
4. `DesirePanel()` - 21 edges
5. `Badge()` - 20 edges
6. `EvidenceRecord` - 19 edges
7. `DialogContent` - 17 edges
8. `EvidenceCard()` - 15 edges
9. `OpportunityDialog()` - 15 edges
10. `PageIntro()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `EvidenceRecord`  [EXTRACTED]
  src/components/pocket/evidence-card.tsx → src/lib/types.ts
- `MetricCard()` --calls--> `cn()`  [EXTRACTED]
  src/components/pocket/metric-card.tsx → src/lib/utils.ts
- `NotFoundComponent()` --calls--> `PocketPal()`  [EXTRACTED]
  src/routes/__root.tsx → src/components/pocket/pocket-pal.tsx
- `AccordionItem` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts
- `AccordionTrigger` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/accordion.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (32 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (53): AccessibilitySettings(), Context, defaults, Prefs, MetricGuide(), terms, DecisionStoryboard(), options (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (44): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, ContextMenuCheckboxItem, ContextMenuContent (+36 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (27): Answer, ResearchAgent(), consumeLastCapturedError(), describeError(), describeStatus(), originalConsoleError, safeStringify(), renderErrorPage() (+19 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (33): AccessibilityProvider(), Toaster(), ToasterProps, getRouter(), Route, Route, Route, Route (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (31): Input, Separator, SidebarContent, SidebarContext, SidebarContextProps, SidebarFooter, SidebarGroup, SidebarGroupAction (+23 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (17): Avatar, AvatarFallback, AvatarImage, HoverCardContent, Progress, RadioGroup, RadioGroupItem, ResizableHandle() (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (20): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (16): campusBackpack, evidence, seededSurveyResponses, getProduct(), PRODUCTS, SEEDED_SURVEY_RESPONSES, DemoStoreProvider(), applyOverride() (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (20): DesirePanel(), Empty(), Section(), FractionStat(), NeedSticker(), EMPTY_FILTERS, IMPORTANCE_LABEL, coOccurrence() (+12 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (13): NAV, ProvenanceBadge(), SiteHeader(), PopoverContent, SelectContent, SelectItem, SelectLabel, SelectScrollDownButton (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (16): Props, Ctx, EvidenceFilters, StoreContext, TrailStep, TagOverride, DesireCoding, DesireId (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (16): BackpackExplorer(), CHART_HELP, ChartPanel(), colors, CoOccurrenceChart(), NeedsChart(), SourceChart(), TrendChart() (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (12): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.21
Nodes (11): DESIRE_ICON, Props, MetricCard(), Props, TILTS, TONE_BAR, TONE_SURFACE, Tone (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (9): Alert, AlertDescription, AlertTitle, alertVariants, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (13): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+5 more)

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (12): AWARENESS_OPTIONS, EXPERIENCE_OPTIONS, hasUsedProduct(), journeyFor(), POSTED_OPTIONS, SurveyAnswers, SurveyInput, surveySchema (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.25
Nodes (11): contextText(), Highlighted(), Props, CLASS_META, CODING_LABEL, formatDate(), FULFILLMENT_META, JOURNEY_LABEL (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (10): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartStyle(), ChartTooltipContent, getPayloadConfigFromPayload() (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (9): Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (11): CodingStatus, ConflictPair, Fulfillment, Hotspot, Importance, RecordOrigin, ResearchQuestion, StatedBudget (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (10): DemoTrail(), SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+2 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 24 - "Community 24"
Cohesion: 0.28
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 26 - "Community 26"
Cohesion: 0.40
Nodes (5): describeThrown(), LovableErrorOptions, LovableEvents, reportLovableError(), Window

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 0`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 27`?**
  _High betweenness centrality (0.464) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08339029391660971 - nodes in this community are weakly interconnected._
- **Why does `Button` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 8`, `Community 9`, `Community 11`, `Community 15`, `Community 16`, `Community 17`, `Community 21`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06203007518796992 - nodes in this community are weakly interconnected._
- **Why does `useDemo()` connect `Community 0` to `Community 2`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 16`, `Community 17`, `Community 21`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06753006475485661 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06871035940803383 - nodes in this community are weakly interconnected._