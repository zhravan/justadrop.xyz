import { OtpRepository } from './repositories/otp.repository';
import { SessionRepository } from './repositories/session.repository';
import { UserRepository } from './repositories/user.repository';
import { OrganizationRepository } from './repositories/organization.repository';
import { OpportunityRepository } from './repositories/opportunity.repository';
import { ApplicationRepository } from './repositories/application.repository';
import { VolunteerRepository } from './repositories/volunteer.repository';
import { FeedbackRepository } from './repositories/feedback.repository';
import { EmailService } from './services/email.service';
import { OtpService } from './services/otp.service';
import { SessionService } from './services/session.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { ModeratorRepository } from './repositories/moderator.repository';
import { ModeratorService } from './services/moderator.service';
import { ModeratorController } from './controllers/moderator.controller';

class Container {
  private _repositories: {
    otp: OtpRepository;
    session: SessionRepository;
    user: UserRepository;
    moderator: ModeratorRepository;
    organization: OrganizationRepository;
    opportunity: OpportunityRepository;
    application: ApplicationRepository;
    volunteer: VolunteerRepository;
    feedback: FeedbackRepository;
  } | null = null;

  private _services: {
    email: EmailService;
    otp: OtpService;
    session: SessionService;
    auth: AuthService;
    moderator: ModeratorService;
  } | null = null;

  private _controllers: {
    auth: AuthController;
    moderator: ModeratorController;
  } | null = null;

  private get repositories() {
    if (!this._repositories) {
      this._repositories = {
        otp: new OtpRepository(),
        session: new SessionRepository(),
        user: new UserRepository(),
        moderator: new ModeratorRepository(),
        organization: new OrganizationRepository(),
        opportunity: new OpportunityRepository(),
        application: new ApplicationRepository(),
        volunteer: new VolunteerRepository(),
        feedback: new FeedbackRepository(),
      };
    }
    return this._repositories;
  }

  private get services() {
    if (!this._services) {
      const emailService = new EmailService();
      const otpService = new OtpService(this.repositories.otp, emailService);
      const sessionService = new SessionService(
        this.repositories.session,
        this.repositories.user,
        this.repositories.moderator
      );
      const authService = new AuthService(
        otpService,
        sessionService,
        emailService,
        this.repositories.user
      );
      const moderatorService = new ModeratorService(
        this.repositories.user,
        this.repositories.moderator
      );

      this._services = {
        email: emailService,
        otp: otpService,
        session: sessionService,
        auth: authService,
        moderator: moderatorService,
      };
    }
    return this._services;
  }

  private get controllers() {
    if (!this._controllers) {
      this._controllers = {
        auth: new AuthController(this.services.auth),
        moderator: new ModeratorController(this.services.moderator),
      };
    }
    return this._controllers;
  }

  getRepositories() {
    return this.repositories;
  }

  getServices() {
    return this.services;
  }

  getControllers() {
    return this.controllers;
  }
}

export const container = new Container();
