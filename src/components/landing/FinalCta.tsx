import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FinalCta = () => (
  <section className="container px-4 py-16 sm:py-24">
    <div className="bento relative overflow-hidden p-10 text-center sm:p-16">
      <div className="orb -left-20 -top-20 h-80 w-80 bg-gradient-sunset" />
      <div className="orb -bottom-24 -right-20 h-96 w-96 bg-gradient-aurora" />
      <div className="relative">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight text-secondary sm:text-5xl">
          Your next great event is <span className="text-gradient">one tap away</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Join thousands of hosts and pros running better events with Vibely.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-full bg-gradient-sunset px-8 text-base font-semibold text-primary-foreground hover:opacity-95">
            <Link to="/auth?mode=signup">
              Start planning free <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8 text-base">
            <Link to="/auth?mode=signup&role=pro">List your service</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);
