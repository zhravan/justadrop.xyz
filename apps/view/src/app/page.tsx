import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  LayoutWithHeader,
  HeroSection,
  Section
} from '@justadrop/common';

export default function HomePage() {
  return (
    <LayoutWithHeader
      headerProps={{
        nav: (
          <>
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </>
        ),
      }}
    >
      <HeroSection
        title="Just a Drop"
        description="A platform connecting volunteers with organizations. Make a difference, one drop at a time."
        actions={
          <>
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </>
        }
      />
      
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Connect</CardTitle>
              <CardDescription>
                Find organizations that need your help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse opportunities and connect with causes that matter to you.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Volunteer</CardTitle>
              <CardDescription>
                Make a meaningful impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contribute your time and skills to create positive change.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Grow</CardTitle>
              <CardDescription>
                Build your volunteer journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your impact and grow as a volunteer.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </LayoutWithHeader>
  );
}
