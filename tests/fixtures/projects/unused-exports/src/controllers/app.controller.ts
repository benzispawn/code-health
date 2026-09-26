function Controller(): ClassDecorator {
  return () => undefined;
}

@Controller()
export class AppController {
  index(): string {
    return 'ok';
  }
}
