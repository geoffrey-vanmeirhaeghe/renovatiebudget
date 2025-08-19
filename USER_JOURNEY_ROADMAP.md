# Belgian Renovation Platform - User Journey Roadmap

## 📋 Executive Summary

Comprehensive user journey design based on multi-expert analysis (Full-Stack Architecture, Belgian Construction Compliance, UX Design, Business Strategy). This document serves as our north star for platform development from current 3D visualization tool to complete renovation management platform.

## 🎯 Core User Journey: "Smart Start" Approach

### Phase 1: Smart Discovery (15 minutes to value)
**Goal**: Quick onboarding with immediate value and compliance insights

**Flow**: `Landing → Quick Assessment → Address Entry → Instant Compliance Report → Account Creation → First 3D Model`

**Key Features**:
- 3-question assessment (Property Type, Renovation Scale, Timeline)
- Address-based Belgian compliance checking
- Regional regulation detection (Flanders/Wallonia/Brussels)
- Smart project initialization

### Phase 2: Guided 3D Creation (30-60 minutes) 
**Goal**: Enhanced existing 3D visualization with Belgian compliance

**Flow**: `Property Type → Room-by-Room Wizard → Smart Defaults → Belgian Validation → 3D Preview → Save`

**Key Features**:
- Mobile-first room addition
- Belgian standard dimensions as smart defaults
- Real-time compliance validation
- Photo-to-3D conversion tools

### Phase 3: Renovation Goal Setting (20-30 minutes)
**Goal**: Transform desires into compliant, budgeted plans

**Flow**: `Priority Selection → Impact Visualization → Requirements → Budget Check → Permit Preview → Contractor Matching`

**Key Features**:
- Visual before/after on 3D model
- EPB energy efficiency calculations
- Permit complexity scoring
- Budget range validation

### Phase 4: Contractor Connection (Variable)
**Goal**: Seamless handoff to qualified professionals

**Flow**: `Project Summary → Matching → Quotes → Comparison → Selection → Project Launch`

**Key Features**:
- Pre-vetted contractor database
- Belgian certification verification
- Project-specific matching
- Transaction fee revenue model

## 🚀 Implementation Roadmap

### CURRENT STATE (Completed)
- ✅ 3D house visualization with TresJS
- ✅ Interactive floor, door, window, roof editing
- ✅ Color-based selection and hover system
- ✅ Camera state management
- ✅ Basic project data structure

### MVP - Phase 1 (Next 3-4 months)
**"Enhanced Current Platform"**
- [ ] **Account & Project Setup** (STARTING NEXT)
  - User registration and authentication
  - Project creation with Belgian address
  - General property attributes
  - Regional compliance detection
- [ ] Enhanced 3D tool with Belgian compliance
- [ ] Guided onboarding workflow
- [ ] Basic contractor database
- [ ] Simple project sharing

### Version 2 (6-8 months)
**"Full Journey Implementation"**
- [ ] Mobile-optimized interfaces
- [ ] Automated permit documentation
- [ ] Advanced contractor matching
- [ ] Project management dashboards
- [ ] Energy efficiency calculations

### Version 3 (12+ months) 
**"Market Leader Features"**
- [ ] AI-powered renovation suggestions
- [ ] Financial services integration
- [ ] Material marketplace
- [ ] Advanced analytics and insights

## 💼 Business Model Integration

### Revenue Streams
1. **Transaction Fees**: 3-5% on contractor payments
2. **Lead Generation**: €25-50 per contractor lead
3. **Premium Subscriptions**: €29-49/month homeowner features
4. **Contractor SaaS**: €89-149/month project management tools
5. **Compliance Services**: €199-399 per permit assistance

### Key Metrics
- Customer Acquisition Cost: €150-250 homeowners, €300-500 contractors  
- Lifetime Value: €800-1,200 homeowners, €2,500-4,000 contractors
- Target: 120%+ Net Dollar Retention

## 🇧🇪 Belgian Compliance Integration

### Regional Considerations
- **Flanders**: EPB requirements, renovation obligations, gas ban timeline
- **Brussels**: 2024 standards (45 kWh/m²), gas ban from 2025
- **Wallonia**: 80 kWh/m² renovation standard, 2025 obligations

### Integration Points
- Municipal building department APIs
- Energy certification systems
- Heritage protection databases
- Professional certification verification

## 🎨 UX Design Principles

### Progressive Disclosure Strategy
1. **Level 1**: Essential basics (always visible)
2. **Level 2**: Contextual details (triggered by action)  
3. **Level 3**: Advanced configuration (expert toggle)
4. **Level 4**: Administrative/legal (on-demand)

### Mobile vs Desktop Allocation
- **Mobile**: Status, communication, photos, simple editing
- **Desktop**: Complex 3D modeling, detailed comparisons, documents
- **Hybrid**: Adaptive interfaces for planning and management

### Error Prevention
- Smart defaults with Belgian standards
- Proactive validation and warnings  
- Unlimited undo/redo with visual diff
- Expert consultation integration

## 🏗️ Technical Architecture

### Current Foundation (Nuxt 3 + TresJS)
- Strong 3D visualization base
- Component-based architecture
- Strapi backend integration ready
- TypeScript for type safety

### Required Enhancements
- User authentication system
- Belgian compliance data integration
- Contractor management system
- Project workflow management
- Mobile-responsive optimizations

## 📈 Success Factors

1. **Supply-Side Focus**: Prioritize contractor acquisition
2. **Energy Efficiency Leverage**: Capitalize on EU regulations
3. **Regulatory Moats**: Build Belgian compliance expertise
4. **Progressive Value**: Quick wins → comprehensive platform
5. **Data Monetization**: Market intelligence opportunities

## 🚧 Current Phase: Account & Project Setup

**Immediate Next Steps**:
1. Design user registration and authentication
2. Create project initialization workflow
3. Implement Belgian address validation
4. Add general property attributes collection
5. Build regional compliance detection

**Success Criteria**:
- User can create account in <2 minutes
- Project setup captures essential property info
- Address automatically determines applicable Belgian regulations
- Smooth transition to existing 3D modeling tool

---

*This roadmap serves as our development guide. Each phase builds on the previous while maintaining user value and business viability. Update this document as we learn and iterate.*

**Last Updated**: August 2024  
**Next Review**: After Account & Project Setup completion